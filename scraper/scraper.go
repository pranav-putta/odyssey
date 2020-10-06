package scraper

import (
	"fmt"
	ody "pranavputta.me/oddysey/scraper/controllers"
	"time"
)

func RefreshDatabase() {
	startTime := time.Now()

	ody.RefreshBills(ody.SenateBillsURL, "101")
	ody.RefreshBills(ody.HouseBillsURL, "101")
	ody.RefreshMembers(ody.SenateBillsURL)
	ody.RefreshMembers(ody.HouseBillsURL)

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}