package controllers

// Person Scraper constants
const (
	// SenateMembersURL is the url to access the list of senate reps,
	// formatted by general assembly number
	SenateMembersURL string = "http://ilga.gov/senate/default.asp?GA=%s"

	// HouseMembersURL is the url to access the list of house reps,
	// formatted by general assembly number
	HouseMembersURL string = "http://ilga.gov/house/default.asp?GA=%s"

	// SenateBillsURL is the url to access the list of senate bills,
	// formatted by general assembly number
	SenateBillsURL string = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=SB&GA=%s&SessionId=108"

	// SenateBillsURL is the url to access the list of senate bills,
	// formatted by general assembly number
	HouseBillsURL string = "http://www.ilga.gov/legislation/grplist.asp?num1=1&num2=10000&DocTypeID=HB&GA=%s&SessionId=108"

	// RootURL is the base url of illinois general assembly website
	RootURL string = "http://ilga.gov"
)
