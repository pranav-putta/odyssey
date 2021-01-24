package controllers

import (
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/gocolly/colly/queue"
	"pranavputta.me/oddysey/scraper/db"
	"pranavputta.me/oddysey/scraper/models"
	"regexp"
	"strconv"
	"strings"
)

var committees []models.Committee

// CommitteeCallback is a callback function that passes the collected Person struct
type CommitteeCallback func(models.Committee, error)

// RefreshCommittees will scrape all senate and house data and upload all data to database
func RefreshCommittees(assembly string) {
	// initialize components
	getCategoriesJson()

	ScrapeCommittees(assembly, func(c models.Committee, err error) {
		committees = append(committees, c)

		fmt.Printf("Done: %s\n", c.Name)
	})
}

// ScrapePeople scrapes all senate and house data for the given general assembly
func ScrapeCommittees(assembly string, callback CommitteeCallback) {
	// collector for page with a list of all members
	committeesCollector := colly.NewCollector(colly.Async(true), colly.DetectCharset())

	// set up collectors
	committeesCollector.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 2})
	committeesCollector.OnHTML("html", func(e *colly.HTMLElement) {
		tmp := collectCommittees(e, assembly)
		committees = append(committees, tmp...)
	})

	// create request queue; one for senate members, and one for house
	q, _ := queue.New(2, &queue.InMemoryQueueStorage{MaxSize: 10000})

	// add senate and house urls to queue
	q.AddURL(fmt.Sprintf(SenateCommitteeURL, assembly))
	q.AddURL(fmt.Sprintf(HouseCommitteeURL, assembly))

	// consume urls
	q.Run(committeesCollector)

	// wait for threads to finish
	committeesCollector.Wait()
	for _, c := range committees {
		db.InsertCommittee(c)
	}
	db.Finish()
}

// collectPeople scrapes data from main link with list of members
func collectCommittees(e *colly.HTMLElement, assembly string) (committees []models.Committee) {
	// get table columns, 5 columns per row
	span := e.DOM.Find(`span:contains("Committees")`)

	// get chamber from URL
	chamber := "senate"
	if strings.Contains(e.Request.URL.String(), "house") {
		chamber = "house"
	}

	fmt.Println(chamber)
	var committee models.Committee
	rows := span.NextAllFiltered("table").First().Find("tr")
	rows.Each(func(i int, row *goquery.Selection) {
		cols := row.Find("td")

		if cols.Length() < 2 || cols.Eq(0).HasClass("whiteheading") {
			return
		}

		committee.Name = cols.Eq(0).Text()
		committee.Chamber = chamber
		committee.Assembly = assembly
		committee.Code = cols.Eq(1).Text()

		url, exists := cols.Eq(0).Find("a").Attr("href")

		if !exists {
			return
		}

		r := regexp.MustCompile("CommitteeID=([0-9]+)")
		tmp := strings.Split(r.FindString(url), "=")
		if len(tmp) > 1 {
			i, err := strconv.Atoi(tmp[1])
			if err != nil {
				return
			}

			committee.Id = i
			committee.Category = getCategoriesJson()[tmp[1]]
		}

		committees = append(committees, committee)
	})
	return committees
}
