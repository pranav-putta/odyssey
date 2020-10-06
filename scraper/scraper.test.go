package scraper

import (
	"fmt"
	ody "pranavputta.me/oddysey/scraper/controllers"
	"time"
)

func test() {
	startTime := time.Now()
	ody.RefreshBills(ody.HouseBillsURL, "101")
	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}
