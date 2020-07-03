// Package controllers is responsible for retrieving data and updating to database
package controllers

// person-controller handles all scraping and database updates
// for data concerning members in the general assembly
// @author: Pranav Putta
// @date: 07/03/2020
import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/gocolly/colly/queue"
	"github.com/pranavputta22/voice/db"
	"github.com/pranavputta22/voice/models"
)

// PersonCallback is a callback function that passes the collected Person struct
type PersonCallback func(models.Person, error)

// RefreshDatabase will scrape all senate and house data and upload all data to database
func RefreshDatabase(assembly string) {
	Scrape(assembly, func(p models.Person, err error) {
		e := db.InsertMember(p)
		if e != nil {
			fmt.Println(e)
		}

		fmt.Printf("Done: %s\n", p.Name)
	})
}

// Scrape scrapes all senate and house data for the given general assembly
func Scrape(assembly string, callback PersonCallback) {
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
