package config

// DatabaseType Constants
type DatabaseType uint8

const (
	// Firestore refers to Google Cloud Firestore database
	Firestore DatabaseType = 0
	// PostgreSQL refers to Google Cloud SQL PostgreSQL database
	PostgreSQL DatabaseType = 1
)
