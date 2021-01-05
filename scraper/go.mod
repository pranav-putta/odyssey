module pranavputta.me/scraper/oddysey

go 1.14

require (
	github.com/jackc/fake v0.0.0-20150926172116-812a484cc733 // indirect
	github.com/ledongthuc/pdf v0.0.0-20200323191019-23c5852adbd2
	pranavputta.me/oddysey/scraper/controllers v0.0.0-00010101000000-000000000000
)

replace (
	pranavputta.me/oddysey/scraper/controllers => ./controllers
	pranavputta.me/oddysey/scraper/db => ./db
	pranavputta.me/oddysey/scraper/models => ./models
)
