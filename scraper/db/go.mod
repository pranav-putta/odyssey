module pranavputta.me/oddysey/scraper/db

go 1.15

require (
	cloud.google.com/go/firestore v1.3.0
	github.com/jackc/pgx v3.6.2+incompatible
	github.com/jackc/pgx/v4 v4.9.0
	github.com/lib/pq v1.8.0
	pranavputta.me/oddysey/scraper/models v0.0.0-00010101000000-000000000000
)

replace pranavputta.me/oddysey/scraper/models => ../models
