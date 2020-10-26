// Package controllers is responsible for retrieving data and updating to database
package controllers

// person-controller handles all scraping and database updates
// for data concerning members in the general assembly
// @author: Pranav Putta
// @date: 07/03/2020
import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/gocolly/colly/queue"
	"pranavputta.me/oddysey/scraper/db"
	"pranavputta.me/oddysey/scraper/models"
)

var people []models.Person
var _emailJson map[string]string

// getEmailsJson converts the human readable map and inverses key
// 					 value pairs for the map to be legible by the computer
func getEmailsJson() map[string]string {
	if len(_emailJson) == 0 {
		// load json file into an empty map
		jsonFile, err := os.Open("emails.json")
		if err != nil {
			fmt.Println(err)
		}
		byteValue, _ := ioutil.ReadAll(jsonFile)
		var data map[string]interface{}
		err = json.Unmarshal(byteValue, &data)
		if err != nil {
			fmt.Println(err)
		}
		err = jsonFile.Close()
		if err != nil {
			fmt.Println(err)
		}

		// initialize map
		_emailJson = make(map[string]string)
		// loop through each key in map
		for k, v := range data {
			_emailJson[k] = v.(map[string]interface{})["email"].(string)
		}
	}
	return _emailJson
}

// PersonCallback is a callback function that passes the collected Person struct
type PersonCallback func(models.Person, error)

// RefreshMembers will scrape all senate and house data and upload all data to database
func RefreshMembers(assembly string) {
	ScrapePeople(assembly, func(p models.Person, err error) {
		people = append(people, p)

		fmt.Printf("Done: %s\n", p.Name)
	})
}

// ScrapePeople scrapes all senate and house data for the given general assembly
func ScrapePeople(assembly string, callback PersonCallback) {
	// collector for page with a list of all members
	peopleCollector := colly.NewCollector(colly.Async(true), colly.DetectCharset())
	personDetailCollector := colly.NewCollector(colly.Async(true), colly.DetectCharset())

	// set up collectors
	peopleCollector.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 2})
	peopleCollector.OnHTML("html", func(e *colly.HTMLElement) {
		collectPeople(e, personDetailCollector, assembly)
	})

	personDetailCollector.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 2})
	personDetailCollector.OnHTML("html", func(e *colly.HTMLElement) {
		collectPersonDetails(e, callback)
	})

	// create request queue; one for senate members, and one for house
	q, _ := queue.New(2, &queue.InMemoryQueueStorage{MaxSize: 10000})

	// add senate and house urls to queue
	q.AddURL(fmt.Sprintf(SenateMembersURL, assembly))
	q.AddURL(fmt.Sprintf(HouseMembersURL, assembly))

	// consume urls
	q.Run(peopleCollector)

	// wait for threads to finish
	peopleCollector.Wait()
	personDetailCollector.Wait()
	for _, p := range people {
		db.InsertMember(p)
	}
	db.Finish()
}

// collectPeople scrapes data from main link with list of members
func collectPeople(e *colly.HTMLElement, detailsCollector *colly.Collector, assembly string) {
	// get table columns, 5 columns per row
	rows := e.DOM.Find(".detail")

	// get chamber from URL
	chamber := "senate"
	if strings.Contains(e.Request.URL.String(), "house") {
		chamber = "house"
	}

	for i := 0; i < rows.Length(); i += 5 {
		// populate context with table information
		ctx := colly.NewContext()
		// td > a > text
		ctx.Put("name", string(rows.Get(i).FirstChild.FirstChild.Data))
		// td > a > attr [href]
		url := RootURL + rows.Get(i).FirstChild.Attr[1].Val
		ctx.Put("url", url)
		// td > text
		ctx.Put("district", rows.Get(i+3).FirstChild.Data)
		// td > text
		ctx.Put("party", rows.Get(i+4).FirstChild.Data)
		// chamber
		ctx.Put("chamber", chamber)
		// assembly
		ctx.Put("assembly", assembly)

		// get member id from url
		id := "0"
		r := regexp.MustCompile("MemberID=([0-9]+)")
		tmp := strings.Split(r.FindString(url), "=")
		if len(tmp) > 1 {
			id = tmp[1]
		}
		ctx.Put("id", id)

		// send details collector to person url; share context
		detailsCollector.Request("GET", url, nil, ctx, nil)
	}
}

// collectPersonDetails scrapes data from each member detail page
func collectPersonDetails(e *colly.HTMLElement, callback PersonCallback) {
	ctx := e.Request.Ctx
	name := ctx.Get("name")
	//fmt.Printf("Trying: %s\n", name)

	doc := e.DOM

	// get image url
	img := RootURL + doc.Find(`img[alt*='`+name+`']`).AttrOr("src", "")
	// get contact information
	var contacts []models.Contact
	doc.Find(`b:contains("Office")`).Each(func(i int, s *goquery.Selection) {
		rows := s.ParentsFilteredUntil("tbody", "table").Children()
		rows = rows.Slice(1, rows.Length())
		address, phone := "", ""
		rows.EachWithBreak(func(i int, t *goquery.Selection) bool {
			if t.Text() != "" && !strings.Contains(t.Text(), "Office") {
				// phone number
				if t.Text()[0] == '(' {
					phone = t.Text()
					return false
				}

				// address
				// TODO: trim and format this
				address += t.Text() + " "
			}
			return true

		})
		// check emails

		// populate contacts array
		contacts = append(contacts, models.Contact{
			Address:     address,
			PhoneNumber: phone})

	})

	// convert strings into integers
	id, err := strconv.Atoi(ctx.Get("id"))
	if err != nil {
		id = -1
	}

	district, err := strconv.Atoi(ctx.Get("district"))
	if err != nil {
		district = -1
	}

	assembly, err := strconv.Atoi(ctx.Get("assembly"))
	if err != nil {
		assembly = 101
	}

	// get email from json
	contacts = append(contacts, models.Contact{Email: getEmailsJson()[strconv.Itoa(id)]})

	// store into person model and send to callback
	callback(models.Person{
		MemberID:        id,
		Name:            ctx.Get("name"),
		PictureURL:      img,
		District:        district,
		Party:           ctx.Get("party"),
		URL:             ctx.Get("url"),
		Chamber:         ctx.Get("chamber"),
		GeneralAssembly: assembly,
		Contacts:        contacts,
	}, nil)
}
