// Package db is a database management backend for the voice mobile application
// @author: Pranav Putta
// @date: June 30, 2020
package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	pq "github.com/lib/pq"
	"github.com/pranavputta22/voice/config"
	"github.com/pranavputta22/voice/models"
	"google.golang.org/api/option"
)

var _client *firestore.Client
var _ctx context.Context
var _db *sql.DB

// retrieves the context instance
func ctx() context.Context {
	if _ctx == nil {
		_ctx = context.Background()
	}

	return _ctx
}

// dumpToMap takes a struct and flattens into map[string]interface{}
func dumpMap(data interface{}) (map[string]interface{}, error) {
	var out map[string]interface{}
	// flatten struct into json data
	res, err := json.Marshal(data)

	if err != nil {
		return nil, err
	}
	// conver from json into map[string]interface{}
	json.Unmarshal(res, &out)
	return out, nil
}

// retrieve credentials
func firestoreCredentials() []byte {
	dat, err := ioutil.ReadFile("service.json")
	if err != nil {
		return nil
	}
	return dat
}

// createFirestoreClient sets up an instance with firestore
func createFirestoreClient(ctx context.Context) *firestore.Client {
	// Use a service account
	sa := option.WithCredentialsJSON(firestoreCredentials())
	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		log.Fatalln(err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}

	return client
}

// createPostgreSQLClient sets up an instance with google cloud sql postgresql
func createPostgreSQLClient() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=disable",
		DBHost, DBPort, DBUser, DBPassword, DBName)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	err = db.Ping()
	if err != nil {
		panic(err)
	}

	return db
}

// retrieves the client instance
func firestoreClient() *firestore.Client {
	if _client == nil {
		_client = createFirestoreClient(ctx())
	}

	return _client
}

// retrieve the client instance
func postgreSQLClient() *sql.DB {
	if _db == nil {
		_db = createPostgreSQLClient()
	}

	return _db
}

// insertFirestore inserts the specified structure into the specified collection
func insertFirestore(collection string, data interface{}) error {
	// convert data into a flat map
	m, err := dumpMap(data)
	if err != nil {
		return err
	}

	// add data to firestore
	_, _, err = firestoreClient().Collection(collection).Add(ctx(), m)
	if err != nil {
		return err
	}

	return nil
}

// InsertMember inserts a new assembly member into the database
func InsertMember(p models.Person) error {
	if config.DATABASE == config.Firestore {
		// send to firestore table
		insertFirestore("members", p)
		return nil
	} else if config.DATABASE == config.PostgreSQL {
		// send to postgresql table
		var client = postgreSQLClient()

		sql := `INSERT INTO members (name, picture_url, chamber, district, member_url, contacts, member_id, party, general_assembly)
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
		_, err := client.Exec(sql, p.Name, p.PictureURL, p.Chamber, p.District, p.URL, pq.Array(p.Contacts), p.MemberID, p.Party, p.GeneralAssembly)
		return err
	} else {
		return nil
	}
}

// InsertBill inserts bill into postgresql
func InsertBill(b models.Bill) error {
	if config.DATABASE == config.Firestore {
		// send to firestore table
		insertFirestore("bills", b)
		return nil
	} else if config.DATABASE == config.PostgreSQL {
		// send to postgresql table
		var client = postgreSQLClient()

		sql := `INSERT INTO bills (assembly, chamber, number, title, short_summary, full_summary,
			sponsor_ids, house_primary_sponsor, senate_primary_sponsor, chief_sponsor, actions, actions_hash)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
				ON CONFLICT (assembly, chamber, number) DO UPDATE
					SET assembly = $1,
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
						actions_hash = $12;`
		_, err := client.Exec(sql, b.Metadata.Assembly, b.Metadata.Chamber, b.Metadata.Number,
			b.Title, b.ShortSummary, b.FullSummary, pq.Array(b.SponsorIDs), b.HousePrimarySponsor,
			b.SenatePrimarySponsor, b.ChiefSponsor, pq.Array(b.Actions), b.ActionsHash)
		return err
	} else {
		return nil
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

	switch err := row.Scan(&name, &pictureURL, &chamber, &district, &memberURL, pq.Array(&contacts), &party); err {
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
	 house_primary_sponsor, senate_primary_sponsor, chief_sponsor, actions, actions_hash
	 from public.bills where assembly=$1 and chamber=$2 and number=$3`
	row := client.QueryRow(query, md.Assembly, md.Chamber, md.Number)

	switch err := row.Scan(&bill.Metadata.Assembly, &bill.Metadata.Chamber, &bill.Metadata.Number, &bill.Title, &bill.ShortSummary, &bill.FullSummary,
		&bill.HousePrimarySponsor, &bill.SenatePrimarySponsor, &bill.ChiefSponsor,
		pq.Array(&bill.Actions), &bill.ActionsHash); err {
	case sql.ErrNoRows:
		return bill, errors.New("no rows found")
	case nil:
		return bill, nil
	default:
		return bill, err
	}
}
