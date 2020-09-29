package main

import (
	"fmt"
	"time"
	ody"pranavputta.me/oddysey/scraper/controllers"
)

func main() {
	startTime := time.Now()
	ody.RefreshBills(ody.SenateBillsURL, "101")

	endTime := time.Now()
	elapsed := endTime.Sub(startTime)
	fmt.Printf("took %s", elapsed.String())
}