package main

import (
	"fmt"
	ody "pranavputta.me/oddysey/scraper/controllers"

	//db "pranavputta.me/oddysey/scraper/db"
	"time"
)

func main() {
	startTime := time.Now()

	//ody.RefreshBills(ody.SenateBillsURL, "101")
	//ody.RefreshBills(ody.HouseBillsURL, "101")
	ody.RefreshMembers("101")

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}
