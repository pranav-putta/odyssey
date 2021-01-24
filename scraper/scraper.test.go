package main

import (
	"fmt"
	ody "pranavputta.me/oddysey/scraper/controllers"
	"time"
)

func refresh() {
	//ody.RefreshBills(ody.HouseBillsURL, "102", "110")
	//ody.RefreshBills(ody.HouseBillsURL, "102")
	//ody.RefreshMembers("101")
	ody.RefreshCommittees("101")

}


func main() {
	startTime := time.Now()

	refresh()

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}
