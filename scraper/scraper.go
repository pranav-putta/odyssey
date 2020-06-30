package main

// TODO: classify actions
// TODO: label as refresh or no refresh : "public act" or "effective date" or "governor approved"
// TODO: voting
// TODO: Bill title "-tech" no good

import (

	//"context"

	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/ledongthuc/pdf"
	//"go.mongodb.org/mongo-driver/bson"
	//"go.mongodb.org/mongo-driver/mongo"
	//"go.mongodb.org/mongo-driver/mongo/options"
)

// types

// bill container class, contains details, sponsor list, and action list
type BillDocument struct {
	Details     *BillDetails
	Sponsors    *[]Sponsor
	Actions     *[]Action
	FullTextURL string
	Votes       *VotingEvent
}

// specifications of the bill number, title, summary, etc.
type BillDetails struct {
	Identifier string
	Chamber    string
	Number     int64
	Assembly   string
	Title      string
	Summary    Summary
	Source     string
}

// sponsor detail
type Sponsor struct {
	Name     string
	Spontype string
	Chamber  string
	Id       string
}

// action detail
type Action struct {
	Date    int64
	Chamber string
	Action  string
}

// summary of a bill
type Summary struct {
	Short        string
	FullAbstract string
}

type VotingEvent struct {
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

func BuildVoting(doc *goquery.Selection) VotingEvent {
	return VotingEvent{}
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

	// gather full text
	full_text := fmt.Sprintf("http://www.ilga.gov/legislation/101/%s/10100%s%04d.htm",
		bill_details.Chamber, bill_details.Chamber, bill_details.Number)

	// get voting events
	voting := BuildVoting(e.DOM)

	// aggregate into one struct
	document = &BillDocument{&bill_details, &sponsor_list, &actions, full_text, &voting}

	// conver to json
	elem, err := json.MarshalIndent(document, "", "")
	if err != nil {
		return document, err
	}

	file_name := fmt.Sprintf("data/bill_%s.json", bill_details.Identifier)
	_ = ioutil.WriteFile(file_name, elem, 0644)
	return document, nil
}

func findLastLine(buf []byte, s string) int {
	bs := []byte(s)
	max := len(buf)
	for {
		i := bytes.LastIndex(buf[:max], bs)
		if i <= 0 || i+len(bs) >= len(buf) {
			return -1
		}
		if (buf[i-1] == '\n' || buf[i-1] == '\r') && (buf[i+len(bs)] == '\n' || buf[i+len(bs)] == '\r') {
			return i
		}
		max = i
	}
}

func FakeReader(buf []byte) (*pdf.Reader, error) {
	if !bytes.HasPrefix(buf, []byte("%PDF-1.")) || buf[7] < '0' || buf[7] > '7' || buf[8] != '\r' && buf[8] != '\n' {
		return nil, fmt.Errorf("not a PDF file: invalid header")
	}
	end := len(buf)
	const endChunk = 100
	buf = buf[endChunk:end]
	for len(buf) > 0 && buf[len(buf)-1] == '\n' || buf[len(buf)-1] == '\r' {
		buf = buf[:len(buf)-1]
	}
	buf = bytes.TrimRight(buf, "\r\n\t ")
	if !bytes.HasSuffix(buf, []byte("%%EOF")) {
		return nil, fmt.Errorf("not a PDF file: missing %%%%EOF")
	}
	i := findLastLine(buf, "startxref")
	if i < 0 {
		return nil, fmt.Errorf("malformed PDF file: missing final startxref")
	}

	r := &pdf.Reader{
		end: end,
	}
	pos := end - endChunk + int64(i)
	b := newBuffer(io.NewSectionReader(f, pos, end-pos), pos)
	if b.readToken() != keyword("startxref") {
		return nil, fmt.Errorf("malformed PDF file: missing startxref")
	}
	startxref, ok := b.readToken().(int64)
	if !ok {
		return nil, fmt.Errorf("malformed PDF file: startxref not followed by integer")
	}
	b = newBuffer(io.NewSectionReader(r.f, startxref, r.end-startxref), startxref)
	xref, trailerptr, trailer, err := readXref(r, b)
	if err != nil {
		return nil, err
	}
	r.xref = xref
	r.trailer = trailer
	r.trailerptr = trailerptr
	if trailer["Encrypt"] == nil {
		return r, nil
	}
	err = r.initEncrypt("")
	if err == nil {
		return r, nil
	}
	if pw == nil || err != ErrInvalidPassword {
		return nil, err
	}
	for {
		next := pw()
		if next == "" {
			break
		}
		if r.initEncrypt(next) == nil {
			return r, nil
		}
	}
	return nil, err
}

func readPdf(path string) (string, error) {

	/*totalPage := r.NumPage()

	for pageIndex := 1; pageIndex <= totalPage; pageIndex++ {
		p := r.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}

		rows, _ := p.GetTextByRow()
		for _, row := range rows {
			println(">>>> row: ", row.Position)
			for _, word := range row.Content {
				fmt.Println(word.S)
			}
		}
	}
	return "", nil*/
}

// scrape the full text
func ScrapeFullText(e *colly.HTMLElement) {
	p.c += 1
	fmt.Println(p)

	// TODO: Finish this, store data somehow
}

// scrape votes : element passed in is the pdf document
func ScrapeVotes(r *colly.Response) (string, error) {
	r, err := FakeReader(r.Body)
	if err != nil {
		return "", err
	}
}

func main() {
	startTime := time.Now()

	var urls [10]string
	urls[0] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=SB&GA=101&SessionId=108"
	urls[1] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=HB&GA=101&SessionId=108"
	urls[2] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=SR&GA=101&SessionId=108"
	urls[3] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=HR&GA=101&SessionId=108"
	urls[4] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=SJR&GA=101&SessionId=108"
	urls[5] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=HJR&GA=101&SessionId=108"
	urls[6] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=SJRCA&GA=101&SessionId=108"
	urls[7] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=HJRCA&GA=101&SessionId=108"
	urls[8] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=EO&GA=101&SessionId=108"
	urls[9] = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=1000400047&DocTypeID=AM&GA=101&SessionId=108"

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

	pc.OnResponse(func(e *colly.Response) {
		fmt.Println(e.Body)
	})
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
		votes_url := e.ChildAttr(`a:contains("Votes")`, "href")
		vc.Visit(e.Request.AbsoluteURL(votes_url))
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
		if strings.Contains(href, "votinghistory") && strings.Contains(href, "pdf") {
			vc_pdf.Visit(e.Request.AbsoluteURL(href))
		}
	})
	vc_pdf.OnResponse(ScrapeVotes)

	vc_pdf.Visit("http://www.ilga.gov/legislation/votehistory/101/house/committeevotes/10100SB0001_23366.pdf")
	pc.Wait()
	bc.Wait()
	dc.Wait()
	vc.Wait()
	vc_pdf.Wait()

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s seconds", elapsed.String())
}
