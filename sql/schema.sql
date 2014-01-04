-- This is wrapped by a transaction in schema.js

CREATE SCHEMA log_aggregate_db
  CREATE TABLE version (version INTEGER)
  --INSERT INTO version VALUES(1)

  -- The entity table is the overall reference 
  CREATE TABLE entity (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    -- entity deals with only binary data but its useful for the
    -- client to have a real content type when serving up the data
    contentType VARCHAR(256),

    -- each entity starts in an incomplete state once data is
    -- complete we don't expect any more part writing
    complete bool DEFAULT false,

    -- current owner of the entity. Intended to be used to indicate who
    -- is processing the data for what purpose. (just for clients)
    owner VARCHAR(256)
  )

  -- each entity is made up of multiple parts
  CREATE TABLE parts (
    id SERIAL PRIMARY KEY,

    entity_id INTEGER REFERENCES entity(id) ON DELETE CASCADE,

    -- refers to the offset in the overall stream
    part_offset INTEGER,

    -- length of current part (mostly for clients dealing with part)
    part_length INTEGER,

    content BYTEA
  );

INSERT INTO log_aggregate_db.version (version) VALUES(1);
