module pranavputta.me/oddysey/scraper/controllers

go 1.15

require (
	github.com/PuerkitoBio/goquery v1.5.1
	github.com/antchfx/htmlquery v1.2.3 // indirect
	github.com/antchfx/xmlquery v1.3.2 // indirect
	github.com/gobwas/glob v0.2.3 // indirect
	github.com/gocolly/colly v1.2.0
	github.com/jackc/fake v0.0.0-20150926172116-812a484cc733 // indirect
	github.com/kennygrant/sanitize v1.2.4 // indirect
	github.com/ledongthuc/pdf v0.0.0-20200323191019-23c5852adbd2
	github.com/saintfish/chardet v0.0.0-20120816061221-3af4cd4741ca // indirect
	github.com/temoto/robotstxt v1.1.1 // indirect
	pranavputta.me/oddysey/scraper/db v0.0.0-00010101000000-000000000000
	pranavputta.me/oddysey/scraper/models v0.0.0-00010101000000-000000000000
)

replace (
	pranavputta.me/oddysey/scraper/db => ../db
	pranavputta.me/oddysey/scraper/models => ../models
)
