package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// Action tag type enum
type Tag int

const (
	// Assigned - "bill assigned to specific committee"
	Assigned Tag = iota
	// EffectiveDate - "bill becomes law"
	EffectiveDate
	// ArrivalInSenate - "Passed in house, passed to senate"
	ArrivalInSenate
	// ArrivalInHouse - "Passed in senate, passed to house"
	ArrivalInHouse
	// CoSponsor - "Added Co-Sponsosr"
	CoSponsor
	// ThirdReadingVote - "Final reading right before vote"
	ThirdReadingVote
	// CommitteeDebate - "Recommendation by committee of sending bill to house/senate to vote on"
	CommitteeDebate
	// SponsorRemoved - "Representative/Senator backed out "
	SponsorRemoved
	// FiscalRequest - "Request how much a bill costs"
	FiscalRequest
	// DualPassed - "Passed in both houses"
	DualPassed
	// SentToGovernor - "In transit to governor"
	SentToGovernor
	// GovernorApproved - "Governor signature"
	GovernorApproved
	// PublicAct - "Official Law"
	PublicAct
	// BillVotePass - "Bill voted and passed in chamber"
	BillVotePass
	// BillVoteFail - "Bill voted and failed in chamber"
	BillVoteFail
	// Amended - "bill ammended and updated"
	Amended
	// Other - "any other"
	Other
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
	BillText             BillFullText
	VoteEvents           []BillVoteEvent
}

// BillMetadata stores bill number, general assembly number, and chamber
type BillMetadata struct {
	Number   int64
	Assembly int64
	Chamber  string
	URL      string
}

// BillFullText stores the data from the full text html data
type BillFullText struct {
	URL      string `json:"url,omitempty"`
	FullText string `json:"fullText,omitempty"`
}

// BillAction stores a single action event data
type BillAction struct {
	Date        int64
	Chamber     string
	Description string
	Tag         Tag
}

// BillVoteEvent stores the voting outcome of a pdf
type BillVoteEvent struct {
}

// Value is an implemented method from database/sql/driver which converts Contact into jsonb
func (ba BillAction) Value() (driver.Value, error) {
	return json.Marshal(ba)
}

// Value converts BillFullText into a json format
func (bft BillFullText) Value() (driver.Value, error) {
	return json.Marshal(bft)
}

// Scan converts BillFullText from json into a struct
func (bft *BillFullText) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, &bft)
}

// Scan is an implemented method from database/sql/driver which converts jsonb into Contact
func (ba *BillAction) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, &ba)
}

