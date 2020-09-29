package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// Contact encodes a specific office contact information
type Contact struct {
	Address     string `json:"address,omitempty"`
	PhoneNumber string `json:"phoneNumber,omitempty"`
}

// Person encodes all senate and house member information in the Illinois General Assembly
type Person struct {
	MemberID        int
	GeneralAssembly int
	Name            string
	PictureURL      string
	Chamber         string
	District        int
	Party           string
	URL             string
	Contacts        []Contact
}

// Value is an implemented method from database/sql/driver which converts Contact into jsonb
func (c Contact) Value() (driver.Value, error) {
	return json.Marshal(c)
}

// Scan is an implemented method from database/sql/driver which converts jsonb into Contact
func (c *Contact) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, &c)
}