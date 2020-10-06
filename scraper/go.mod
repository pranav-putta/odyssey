module pranavputta.me/scraper/oddysey

go 1.14

require (
	cloud.google.com/go/firestore v1.3.0
	github.com/PuerkitoBio/goquery v1.5.1
	github.com/antchfx/htmlquery v1.2.3 // indirect
	github.com/go-delve/delve v1.5.0 // indirect
	github.com/gobwas/glob v0.2.3 // indirect
	github.com/gocolly/colly v1.2.0
	github.com/kennygrant/sanitize v1.2.4 // indirect
	github.com/lib/pq v1.8.0
	github.com/saintfish/chardet v0.0.0-20120816061221-3af4cd4741ca // indirect
	github.com/temoto/robotstxt v1.1.1 // indirect
	pranavputta.me/oddysey/scraper/controllers v0.0.0-00010101000000-000000000000
	pranavputta.me/oddysey/scraper/db v0.0.0-00010101000000-000000000000
)

replace (
	pranavputta.me/oddysey/scraper/controllers => ./controllers
	pranavputta.me/oddysey/scraper/db => ./db
	pranavputta.me/oddysey/scraper/models => ./models
)
