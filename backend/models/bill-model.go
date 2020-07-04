package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// Bill container
type Bill struct {
	Metadata             BillMetadata
	Title                string
	ShortSummary         string
	FullSummary          string
	SponsorIDs           []int
	HousePrimarySponsor  int
	SenatePrimarySponsor int
	ChiefSponsor         int
	Actions              []BillAction
	ActionsHash          string

	BillText struct {
		URL      string
		FullText string
	}
	VoteEvents []BillVoteEvent
}

// BillMetadata stores bill number, general assembly number, and chamber
type BillMetadata struct {
	Number   int64
	Assembly int64
	Chamber  string
	URL      string
}

// BillAction stores a single action event data
type BillAction struct {
	Date        int64
	Chamber     string
	Description string
	Tag         string
}

// Value is an implemented method from database/sql/driver which converts Contact into jsonb
func (ba BillAction) Value() (driver.Value, error) {
	return json.Marshal(ba)
}

// Scan is an implemented method from database/sql/driver which converts jsonb into Contact
func (c *BillAction) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, &c)
}

type BillVoteEvent struct {
}
