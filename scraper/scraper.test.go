package main

import (
	"fmt"
	ody "pranavputta.me/oddysey/scraper/controllers"
	"time"
)

func refresh() {
	ody.RefreshBills(ody.SenateBillsURL, "101")
	//ody.RefreshBills(ody.HouseBillsURL, "101")
	//ody.RefreshMembers("101")

}


func main() {
	startTime := time.Now()

	refresh()

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}
