package controllers

import (
	"fmt"
	"testing"
	"time"
)

func TestBillScrape(t *testing.T) {
	startTime := time.Now()
	RefreshBills(SenateBillsURL, "101")

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}
