package models

// Contact encodes a specific office contact information
type Contact struct {
	Address     string
	PhoneNumber string
}

// Person encodes all senate and hosue members in the Illinois General Assembly
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
