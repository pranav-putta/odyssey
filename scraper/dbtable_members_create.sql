-- Table: public.members

-- DROP TABLE public.members;

CREATE TABLE public.members
(
    name text COLLATE pg_catalog."default",
    picture_url text COLLATE pg_catalog."default",
    chamber character varying(10) COLLATE pg_catalog."default" NOT NULL,
    district integer,
    member_url text COLLATE pg_catalog."default",
    contacts jsonb[],
    member_id integer NOT NULL,
    party character varying(1) COLLATE pg_catalog."default",
    general_assembly integer NOT NULL,
    CONSTRAINT members_pkey PRIMARY KEY (member_id, chamber, general_assembly)
)

TABLESPACE pg_default;

ALTER TABLE public.members
    OWNER to postgres;