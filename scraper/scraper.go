package main

// TODO: classify actions
// TODO: label as refresh or no refresh : "public act" or "effective date" or "governor approved"
// TODO: add urls for documents in bill json file

import (
	//"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	//"go.mongodb.org/mongo-driver/bson"
	//"go.mongodb.org/mongo-driver/mongo"
	//"go.mongodb.org/mongo-driver/mongo/options"
)

// temporary for tracking purposes
// TODO: delete this
type Progress struct {
	a int
	b int
	c int
	d int
	e int
}

var p = Progress{0, 0, 0, 0, 0}

// types
type BillDocument struct {
	Details  *BillDetails
	Sponsors *[]Sponsor
	Actions  *[]Action
}

type BillDetails struct {
	Identifier string
	Chamber    string
	Number     int64
	Assembly   string
	Title      string
	Summary    Summary
	Source     string
}

type Sponsor struct {
	Name     string
	Spontype string
	Chamber  string
	Id       string
}

type Action struct {
	Date    int64
	Chamber string
	Action  string
}

type Summary struct {
	Short        string
	FullAbstract string
}

// constants
const document_url = "http://www.ilga.gov/legislation/101/%s/10100%s%04d.htm"

func OnVisitLink(r *colly.Request) {
	fmt.Println("Visiting", r.URL.String())
}

// generate bill details
func BuildBillDetails(e *colly.HTMLElement) BillDetails {
	url := e.Request.URL.String()

	// bill number details
	r := regexp.MustCompile("DocNum=([0-9]+)")
	tmp := strings.Split(r.FindString(url), "=")
	var bill_num int64

	if len(tmp) > 1 {
		tmp, err := strconv.ParseInt(tmp[1], 0, 64)
		if err != nil {
			bill_num = -1
		} else {
			bill_num = tmp
		}
	}

	// bill type details
	r = regexp.MustCompile("DocTypeID=([A-Za-z]+)")
	tmp = strings.Split(r.FindString(url), "=")
	bill_chamber := ""

	if len(tmp) > 1 {
		bill_chamber = tmp[1]
	}

	// bill general assembly
	r = regexp.MustCompile("GA=([0-9]+)")
	tmp = strings.Split(r.FindString(url), "=")
	bill_ga := ""

	if len(tmp) > 1 {
		bill_ga = tmp[1]
	}

	// concatenate
	bill_id := fmt.Sprint(bill_chamber, bill_num)

	// bill title
	bill_title := e.DOM.Find(`span:contains("Short Description") ~ span.content`).First().Text()

	// bill summary
	short_summary := e.DOM.Find(`span:contains("Synopsis") ~ span.content`).First().Text()
	full_abstract := e.DOM.Find(`span:contains("Synopsis") ~ span.content`).First().NextAllFiltered("span.content").Text()
	summary := Summary{short_summary, full_abstract}

	return BillDetails{bill_id, bill_chamber, bill_num, bill_ga, bill_title, summary, url}
}

// generate the list of sponsors for this bill
func BuildSponsorList(doc *goquery.Selection) []Sponsor {
	var sponsor_list []Sponsor
	house_primary, senate_primary := false, false

	// loop through each sponsor : query: "a.content"
	doc.Find(`a.content`).Each(func(i int, s *goquery.Selection) {
		sponsor_name, sponsor_type := s.Text(), "cosponsor"
		sponsor_chamber, sponsor_id := "", ""
		href, href_exists := s.Attr("href")

		// only if href exists should further information be captured
		if href_exists {
			// determine chamber type : house or senate
			if strings.Contains(href, "house") {
				sponsor_chamber = "house"
				// if no house primary is taken yet, assign
				if !house_primary {
					sponsor_type = "primary"
					house_primary = false
				}
			} else if strings.Contains(href, "senate") {
				sponsor_chamber = "senate"
				// if no senate primary is taken yet, assign
				if !senate_primary {
					sponsor_type = "primary"
					senate_primary = true
				}
			}

			// extract the member id from href
			r := regexp.MustCompile("MemberID=([0-9]+)")
			tmp := strings.Split(r.FindString(href), "=")
			if len(tmp) > 1 {
				sponsor_id = tmp[1]
			}
		}
		// append into list
		sponsor_list = append(sponsor_list, Sponsor{sponsor_name, sponsor_type, sponsor_chamber, sponsor_id})
	})

	return sponsor_list
}

// generate the list of actions for this bill
func BuildActions(doc *goquery.Selection) []Action {
	var action_list []Action

	actions_table := doc.Find(`a[name="actions"] ~ table`).First().Find("tr")
	actions_table.Each(func(i int, s *goquery.Selection) {
		td := s.Find(`td.content`)
		// if not heading row
		if td.Size() == 3 {
			// date of action
			date, err := time.Parse(`1/2/2006`, strings.TrimSpace(td.Eq(0).Text()))
			// convert date into utc milliseconds
			var millis int64 = -1
			if err == nil {
				millis = (date.UTC().UnixNano() / 1000000)
			}
			// legislative body of action
			chamber := td.Eq(1).Text()
			// action
			action := td.Eq(2).Text()

			// append to list
			action_list = append(action_list, Action{millis, chamber, action})
		}
	})
	// TODO: match sponsors with actions in the future
	return action_list
}

// aggregates bill details, sponsor list, and actions into one json
func BuildBillDocument(e *colly.HTMLElement) (*BillDocument, error) {
	// initialize document pointer
	document := new(BillDocument)

	// scrape bill details
	bill_details := BuildBillDetails(e)
	// scrape sponsors available
	sponsor_list := BuildSponsorList(e.DOM)
	// scrape actions table
	actions := BuildActions(e.DOM)

	// aggregate into one struct
	document = &BillDocument{&bill_details, &sponsor_list, &actions}

	// conver to json
	elem, err := json.MarshalIndent(document, "", "")
	if err != nil {
		return document, err
	}

	file_name := fmt.Sprintf("data/bill_%s.json", bill_details.Identifier)
	_ = ioutil.WriteFile(file_name, elem, 0644)
	return document, nil
}

// scrape the full text
func ScrapeFullText(e *colly.HTMLElement) {
	p.c += 1
	fmt.Println(p)

	// TODO: Finish this, store data somehow
}

// scrape votes : element passed in is the pdf document
func ScrapeVotes(e *colly.HTMLElement) {
	p.e += 1
	fmt.Println(p)

	// TODO: grab the actual vote results
}

func main() {
	startTime := time.Now()

	pc := colly.NewCollector(colly.Async(true))
	bc := pc.Clone()
	dc := pc.Clone()
	vc := pc.Clone()
	vc_pdf := pc.Clone()

	// set up collectors
	pc.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 4})
	bc.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 4})
	dc.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 4})
	vc.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 4})
	vc_pdf.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 4})

	// callback for when link page is accessed
	pc.OnHTML("li", func(e *colly.HTMLElement) {
		p.a += 1
		//fmt.Println(p)

		link := e.ChildAttr("a", "href")
		bc.Visit(e.Request.AbsoluteURL(link))
	})

	// callback for when bill link is accessed
	bc.OnHTML("body", func(e *colly.HTMLElement) {
		p.b += 1
		//fmt.Println(p)

		// scrape the bill details
		bill_doc, err := BuildBillDocument(e)

		if err != nil {
			fmt.Printf("error: %s\n", err)
		} else {
			fmt.Printf("done with bill: %s\n", bill_doc.Details.Identifier)
		}

		// scrape document
		//doc_url := fmt.Sprintf(document_url, bill_details.chamber, bill_details.chamber, bill_details.number)
		//dc.Visit(e.Request.AbsoluteURL(doc_url))

		// scrape votes
		//votes_url := e.ChildAttr(`a:contains("Votes")`, "href")
		//vc.Visit(e.Request.AbsoluteURL(votes_url))
	})
	dc.OnHTML("", func(e *colly.HTMLElement) {
		p.c += 1
		//fmt.Println(p)
	})
	vc.OnHTML("a[href]", func(e *colly.HTMLElement) {
		p.d += 1
		//fmt.Println(p)

		href := e.Attr("href")

		// if the string actually contains voting history
		if strings.Contains(href, "votinghistory") {
			vc_pdf.Visit(e.Request.AbsoluteURL(href))
		}
	})
	vc_pdf.OnHTML("", ScrapeVotes)

	pc.Visit("http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=100000&DocTypeID=SB&GA=101&SessionId=108")
	pc.Wait()
	bc.Wait()
	dc.Wait()
	vc.Wait()
	vc_pdf.Wait()

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s seconds", elapsed.String())
}
