package controllers

// Person Scraper constants
const (
	// SenateMembersURL is the url to access the list of senate reps,
	// formatted by general assembly number
	SenateMembersURL string = "http://ilga.gov/senate/default.asp?GA=%s"

	// HouseMembersURL is the url to access the list of house reps,
	// formatted by general assembly number
	HouseMembersURL string = "http://ilga.gov/house/default.asp?GA=%s"

	// RootURL is the base url of illinois general assembly website
	RootURL string = "http://ilga.gov"
)
