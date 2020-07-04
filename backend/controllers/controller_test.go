package controllers

import (
	"testing"
)

func TestBillScrape(t *testing.T) {
	RefreshBills(SenateBillsURL, "101")
}
