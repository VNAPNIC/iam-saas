ALTER TABLE "users"
ADD COLUMN "password_reset_token" VARCHAR(255) NULL,
ADD COLUMN "password_reset_token_expires_at" TIMESTAMPTZ NULL;

CREATE INDEX ON "users" ("password_reset_token");
