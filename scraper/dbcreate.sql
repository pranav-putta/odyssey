-- Drop table

-- DROP TABLE public.bills;

CREATE TABLE public.bills (
	assembly int4 NOT NULL,
	chamber varchar(10) NOT NULL,
	"number" int4 NOT NULL,
	title text NULL,
	short_summary text NULL,
	full_summary text NULL,
	sponsor_ids _int4 NULL,
	house_primary_sponsor int4 NULL,
	senate_primary_sponsor int4 NULL,
	actions _jsonb NULL,
	actions_hash text NULL,
	voting_events _jsonb NULL,
	chief_sponsor int4 NULL,
	url text NULL,
	last_updated int8 NULL,
	bill_text jsonb NULL,
	CONSTRAINT bills_pkey PRIMARY KEY (assembly,chamber,"number")
);

