// Package db is a database management backend for the voice mobile application
// @author: Pranav Putta
// @date: June 30, 2020
package db

import (
	"context"
	"database/sql"
	"errors"
	"github.com/jackc/pgx"
	"github.com/lib/pq"
	"pranavputta.me/oddysey/scraper/models"
	"time"
)

var _ctx context.Context
var _db *pgx.ConnPool
var _tx *pgx.Tx
var _batch *pgx.Batch

func Initialize() {
	postgreSQLClient()
}

// retrieves the context instance
func ctx() context.Context {
	if _ctx == nil {
		_ctx = context.Background()
	}

	return _ctx
}

// createPostgresClient generates a new connection to database
func createPostgresClient() *pgx.ConnPool {
	conf := pgx.ConnPoolConfig{
		ConnConfig: pgx.ConnConfig{
			Host:     DBHost,
			Port:     DBPort,
			User:     DBUser,
			Password: DBPassword,
			Database: DBName,
		},
		MaxConnections: 5,
	}
	conn, err := pgx.NewConnPool(conf)
	if err != nil {
		panic(err)
	}
	return conn
}

// retrieve the client instance
func postgreSQLClient() *pgx.ConnPool {
	if _db == nil {
		_db = createPostgresClient()

		tx, err := _db.BeginEx(ctx(), nil)
		_tx = tx
		if err != nil {
			panic(err)
		}
		_batch = _tx.BeginBatch()
	}
	return _db
}

func billBatch() *pgx.Batch {
	if _db == nil || _batch == nil {
		postgreSQLClient()
	}
	return _batch
}

// InsertMember inserts a new assembly member into the database
func InsertMember(p models.Person) {
	// send to postgresql table
	query := `INSERT INTO members (name, picture_url, chamber, district, member_url, contacts, member_id, party, general_assembly)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				ON CONFLICT (member_id, chamber, general_assembly) DO UPDATE
					SET name = $1,
						picture_url = $2,
						chamber = $3,
						district = $4,
						member_url = $5,
						contacts = $6,
						member_id = $7,
						party = $8,
						general_assembly = $9;`

	args := []interface{}{
		p.Name,
		p.PictureURL,
		p.Chamber,
		p.District,
		p.URL,
		pq.Array(p.Contacts),
		p.MemberID,
		p.Party,
		p.GeneralAssembly}
	_, err := postgreSQLClient().Exec(query, args...)
	if err != nil {
		panic(err)
	}
}

// InsertBill inserts bill into postgresql
func InsertBill(b models.Bill) {
	// send to postgresql table
	query := `INSERT INTO bills (assembly, chamber, number, title, short_summary, full_summary,
			sponsor_ids, house_primary_sponsor, senate_primary_sponsor, chief_sponsor, actions,
			actions_hash, url, last_updated, bill_text, category, committee, voting_events, viewable, created)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
				ON CONFLICT (assembly, chamber, number) 
				DO 
					UPDATE SET assembly = $1,
						chamber = $2,
						number = $3,
						title = $4,
						short_summary = $5,
						full_summary = $6,
						sponsor_ids = $7,
						house_primary_sponsor = $8,
						senate_primary_sponsor = $9,
						chief_sponsor = $10,
						actions = $11,
						actions_hash = $12,
						url = $13,
						last_updated = $14,
						bill_text = $15,
						category = $16,
						committee = $17,
						voting_events = $18,
						viewable = $19,
						created = $20;`

	args := []interface{}{
		b.Metadata.Assembly,
		b.Metadata.Chamber,
		b.Metadata.Number,
		b.Title,
		b.ShortSummary,
		b.FullSummary,
		b.SponsorIDs,
		b.HousePrimarySponsor,
		b.SenatePrimarySponsor,
		b.ChiefSponsor,
		pq.Array(b.Actions),
		b.ActionsHash,
		b.Metadata.URL,
		time.Now().UnixNano() / 1000000,
		b.BillText,
		b.Category,
		b.CommitteeID,
		pq.Array(b.VoteEvents),
		b.Viewable,
		b.Created,
	}
	_, err := postgreSQLClient().Exec(query, args...)
	if err != nil {
		panic(err)
	}
}

// GetMember finds the row with the specified ga and member id
func GetMember(ga int, memberID int) (models.Person, error) {
	// get client
	var client = postgreSQLClient()
	query := `select (name, picture_url, chamber, district, member_url, contacts, party)
	 from public.members where general_assembly=$1 and member_id=$2`
	row := client.QueryRow(query, ga, memberID)

	var name string
	var pictureURL string
	var chamber string
	var district int
	var memberURL string
	var contacts []models.Contact
	var party string
	var person models.Person

	switch err := row.Scan(&name, &pictureURL, &chamber, &district, &memberURL, &contacts, &party); err {
	case sql.ErrNoRows:
		return person, errors.New("no rows found")
	case nil:
		person = models.Person{
			MemberID:        memberID,
			GeneralAssembly: ga,
			Name:            name,
			PictureURL:      pictureURL,
			Chamber:         chamber,
			District:        district,
			Party:           party,
			URL:             memberURL,
			Contacts:        contacts,
		}
		return person, nil
	default:
		return person, err
	}
}

// GetBill retrieves data for specified bill
func GetBill(md models.BillMetadata) (bill models.Bill, err error) {
	// get client
	var client = postgreSQLClient()
	query := `select assembly, chamber, number, title, short_summary, full_summary,
	 house_primary_sponsor, senate_primary_sponsor, chief_sponsor, actions, actions_hash, url, bill_text, category,
	 committee, voting_events, viewable, created from public.bills where assembly=$1 and chamber=$2 and number=$3`
	row := client.QueryRow(query, md.Assembly, md.Chamber, md.Number)

	switch err := row.Scan(&bill.Metadata.Assembly, &bill.Metadata.Chamber, &bill.Metadata.Number, &bill.Title, &bill.ShortSummary, &bill.FullSummary,
		&bill.HousePrimarySponsor, &bill.SenatePrimarySponsor, &bill.ChiefSponsor,
		pq.Array(&bill.Actions), &bill.ActionsHash, &bill.Metadata.URL, &bill.BillText, &bill.Category, &bill.CommitteeID, pq.Array(&bill.VoteEvents), &bill.Viewable, &bill.Created); err {
	case sql.ErrNoRows:
		return bill, errors.New("item not found")
	case nil:
		return bill, nil
	default:
		return bill, err
	}
}

// GetAllBills retrieves all bills from database
func GetAllBills() (bills map[int64]models.Bill, err error) {
	var client = postgreSQLClient()
	query := `select assembly, chamber, number, title, short_summary, full_summary,
	 house_primary_sponsor, senate_primary_sponsor, chief_sponsor, actions, actions_hash, url, bill_text
	 from public.bills`
	rows, err := client.Query(query)
	if err != nil {
		return nil, err
	}
	var bill models.Bill
	bills = make(map[int64]models.Bill)
	for rows.Next() {
		err = rows.Scan(&bill.Metadata.Assembly, &bill.Metadata.Chamber, &bill.Metadata.Number, &bill.Title, &bill.ShortSummary, &bill.FullSummary,
			&bill.HousePrimarySponsor, &bill.SenatePrimarySponsor, &bill.ChiefSponsor,
			&bill.Actions, &bill.ActionsHash, &bill.Metadata.URL, &bill.BillText)
		if err != nil {
			return nil, err
		}
		bills[bill.Metadata.Number] = bill
	}
	return bills, nil
}

// Finish commits everything to the database and closes conn
func Finish() {
	postgreSQLClient().Close()
}
