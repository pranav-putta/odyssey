-- Table: public.bills

-- DROP TABLE public.bills;

CREATE TABLE public.bills
(
    assembly integer NOT NULL,
    chamber character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "number" integer NOT NULL,
    title text COLLATE pg_catalog."default",
    short_summary text COLLATE pg_catalog."default",
    full_summary text COLLATE pg_catalog."default",
    sponsor_ids integer[],
    house_primary_sponsor integer,
    senate_primary_sponsor integer,
    actions jsonb[],
    actions_hash text COLLATE pg_catalog."default",
    voting_events jsonb[],
    chief_sponsor integer,
    url text COLLATE pg_catalog."default",
    last_updated bigint,
    bill_text jsonb,
    category text COLLATE pg_catalog."default",
	committee text COLLATE pg_catalog."default",
    CONSTRAINT bills_pkey PRIMARY KEY (assembly, chamber, "number")
)

TABLESPACE pg_default;

ALTER TABLE public.bills
    OWNER to postgres;

