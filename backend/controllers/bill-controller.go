// Package controllers is responsible for retrieving data and updating to database
package controllers

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/pranavputta22/voice/db"
	"github.com/pranavputta22/voice/models"
)

// BillCallback is a function to be called when bill information is retrieved
type BillCallback func(models.Bill, error)

func RefreshBills(url string, ga string) {
	ScrapeBills(url, ga, func(b models.Bill, err error) {
		e := db.InsertBill(b)
		if e != nil {
			fmt.Println(e)
		}

		fmt.Printf("Done: Bill #%d\n", b.Metadata.Number)
	})
}

// ScrapeBills retrieves all bill data given the url of a list of bills from http://ilga.gov/
func ScrapeBills(url string, ga string, callback BillCallback) error {
	// bill details collector
	billCollector := colly.NewCollector(colly.Async(true), colly.DetectCharset())

	// setup collectors
	billCollector.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 4})
	billCollector.OnHTML("body", func(e *colly.HTMLElement) {
		onBillDetailsResponse(e, callback)
	})

	// get bills document from provided url
	url = fmt.Sprintf(url, ga)
	billsDoc, err := goquery.NewDocument(url)
	if err != nil {
		return errors.New("couldn't scrape")
	}

	// go through each link on the page
	billsDoc.Find("li").Each(func(_ int, el *goquery.Selection) {
		// access each bill link and visit
		link, exists := el.Find("a").Attr("href")
		if !exists {
			return
		}

		// get absolute url
		link, err := absoluteURL(link)
		if err != nil {
			return
		}
		billCollector.Visit(link)
	})
	billCollector.Wait()

	return nil
}

// callback for when bill details collector respond
func onBillDetailsResponse(e *colly.HTMLElement, callback BillCallback) {
	doc := e.DOM
	shouldUpdate := false

	// get metadata to retrieve from database
	md, err := buildBillMetadata(e)

	if err != nil {
		fmt.Println(e.Request.URL.String(), " : ", err)
		return
	}

	// get row from database
	bill, err := db.GetBill(md)

	// always update bill metadata, title, summary, and sponsors
	// bill metadata
	bill.Metadata = md

	// bill title
	bill.Title = doc.Find(`span:contains("Short Description") ~ span.content`).First().Text()

	// bill summary
	bill.ShortSummary = doc.Find(`span:contains("Synopsis") ~ span.content`).First().Text()
	bill.FullSummary = doc.Find(`span:contains("Synopsis") ~ span.content`).First().NextAllFiltered("span.content").Text()

	// bill sponsors
	bill.SponsorIDs, bill.HousePrimarySponsor, bill.SenatePrimarySponsor, bill.ChiefSponsor = buildSponsors(doc)

	// bill actions
	newActions := buildActions(doc)
	hash := ""
	shouldUpdate = bill.ActionsHash == hash
	// TODO: figure out hash of actions and compare here

	// if actions are different, update actions as well and decide whether to update votes and full text
	if shouldUpdate {
		// bill actions
		updateText, updateVotes := checkActionsForUpdates(newActions)
		bill.Actions = newActions
		bill.ActionsHash = hash

		if updateText {
			// scoop text data
		}

		if updateVotes {
			// scoop voting data
		}
	}
	callback(bill, nil)
}

// hash the actions table for comparison
func hashActions(doc *goquery.Selection) (string, error) {
	// find actions table
	actionsHTML, err := doc.Find(`a[name="actions"] ~ table`).First().Html()
	if err != nil {
		return "", err
	}

	// hash the html and compare
	hash := md5.Sum([]byte(actionsHTML))
	return hex.EncodeToString(hash[:]), nil
}

// build bill metadata
func buildBillMetadata(e *colly.HTMLElement) (models.BillMetadata, error) {
	var metadata models.BillMetadata

	url := e.Request.URL.String()

	// bill number details
	r := regexp.MustCompile("DocNum=([0-9]+)")
	tmp := strings.Split(r.FindString(url), "=")
	var billNum int64

	if len(tmp) > 1 {
		tmp1, err := strconv.ParseInt(tmp[1], 0, 64)
		if err != nil {
			return metadata, errors.New("couldn't get bill number")
		}
		billNum = tmp1
	} else {
		return metadata, errors.New("couldn't get bill number")
	}

	// bill chamber details
	r = regexp.MustCompile("DocTypeID=([A-Za-z]+)")
	tmp = strings.Split(r.FindString(url), "=")
	billChamber := ""

	if len(tmp) > 1 {
		billChamber = tmp[1]
	} else {
		return metadata, errors.New("couldn't get bill number")
	}

	// bill general assembly
	r = regexp.MustCompile("GA=([0-9]+)")
	tmp = strings.Split(r.FindString(url), "=")
	var billGA int64

	if len(tmp) > 1 {
		tmp1, err := strconv.ParseInt(tmp[1], 0, 64)
		if err != nil {
			return metadata, errors.New("couldn't get bill number")
		}
		billGA = tmp1
	} else {
		return metadata, errors.New("couldn't get bill number")
	}

	metadata = models.BillMetadata{
		Assembly: billGA,
		Chamber:  billChamber,
		Number:   billNum,
		URL:      url,
	}

	return metadata, nil
}

// generate the list of sponsors for this bill
func buildSponsors(doc *goquery.Selection) (sponsors []int, housePrimaryID int, senatePrimaryID int, chiefID int) {
	housePrimaryID, senatePrimaryID, chiefID = -1, -1, -1
	housePrimarySelected, senatePrimarySelected := false, false

	// loop through each sponsor : query: "a.content"
	doc.Find(`a.content`).Each(func(i int, s *goquery.Selection) {
		sponsorID := -1
		href, hrefExists := s.Attr("href")

		// only if href exists should further information be captured
		if hrefExists {
			// extract the member id from href
			r := regexp.MustCompile("MemberID=([0-9]+)")
			tmp := strings.Split(r.FindString(href), "=")
			if len(tmp) > 1 {
				id, err := strconv.Atoi(tmp[1])
				if err == nil {
					sponsorID = id
				}
			}

			if i == 0 {
				chiefID = sponsorID
			}

			// determine chamber type : house or senate
			if strings.Contains(href, "house") {
				// if no house primary is taken yet, assign
				if !housePrimarySelected {
					housePrimarySelected = false
					housePrimaryID = sponsorID
				}
			} else if strings.Contains(href, "senate") {
				// if no senate primary is taken yet, assign
				if !senatePrimarySelected {
					senatePrimarySelected = true
					senatePrimaryID = sponsorID
				}
			}
		}
		// append into list
		sponsors = append(sponsors, sponsorID)
	})

	return sponsors, housePrimaryID, senatePrimaryID, chiefID
}

// generate the list of actions for this bill
// TODO: generate action labels
func buildActions(doc *goquery.Selection) (actions []models.BillAction) {
	actionsTable := doc.Find(`a[name="actions"] ~ table`).First().Find("tr")
	actionsTable.Each(func(i int, s *goquery.Selection) {
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
			actions = append(actions, models.BillAction{millis, chamber, action, ""})
		}
	})
	// TODO: match sponsors with actions in the future
	return actions
}

// check action labels for indication that a vote or ammendment may have happened
func checkActionsForUpdates(actions []models.BillAction) (updateText bool, updateVotes bool) {
	// TODO: complete this function
	return false, false
}

// takes url and prepends root url
func absoluteURL(href string) (string, error) {
	if strings.HasPrefix(href, RootURL) {
		return href, nil
	} else if strings.HasPrefix(href, "/") {
		return fmt.Sprintf("%s%s", RootURL, href), nil
	} else {
		return href, errors.New("couldn't derive absolute url")
	}
}
