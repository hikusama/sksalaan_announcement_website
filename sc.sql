-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.announcement (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  what character varying NOT NULL,
  when timestamp without time zone NOT NULL,
  who character varying NOT NULL,
  where character varying NOT NULL,
  description character varying NOT NULL,
  CONSTRAINT announcement_pkey PRIMARY KEY (id)
);