-- Table: public.committees

-- DROP TABLE public."committees ";

CREATE TABLE public.committees
(
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    category character varying(50) COLLATE pg_catalog."default" NOT NULL,
    code character varying(10) COLLATE pg_catalog."default" NOT NULL,
    id integer NOT NULL,
    chamber character varying(10) COLLATE pg_catalog."default" NOT NULL,
    assembly character varying(5) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT committee_pkey PRIMARY KEY (assembly, chamber, id)
)

TABLESPACE pg_default;

ALTER TABLE public."committees "
    OWNER to postgres;