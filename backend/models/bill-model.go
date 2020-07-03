package models

// Bill container
type Bill struct {
	Information struct {
		Chamber  string
		Number   int
		Assembly int
		Title    string
		URL      string
	}
	PrimarySponsor int
	SponsorIDs     []int
	Summary        struct {
		Short string
		Full  string
	}
	BillText struct {
		URL      string
		FullText string
	}
	Actions []struct {
		Date    int64
		Chamber string
		Action  string
		Tag     string
	}
}
