-- Tệp này chỉ chứa các lệnh CREATE TABLE để định nghĩa cấu trúc cơ sở dữ liệu.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng chứa các gói dịch vụ (plans)
CREATE TABLE "plans" (
    "id" BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "user_quota" INT NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng chứa thông tin về các khách hàng (tenants)
CREATE TABLE "tenants" (
    "id" BIGSERIAL PRIMARY KEY,
    "plan_id" BIGINT,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
    "logo_url" VARCHAR(255),
    "primary_color" VARCHAR(7),
    "allow_public_signup" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_quota" INT NOT NULL DEFAULT 5,
    key UUID UNIQUE DEFAULT gen_random_uuid (),
    is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE SET NULL
);

CREATE INDEX ON "tenants" ("status");

-- Bảng chứa thông tin người dùng
CREATE TABLE "users" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "mfa_secret" VARCHAR(255) NULL,
    "name" VARCHAR(255),
    "avatar_url" TEXT,
    "phone_number" VARCHAR(20),
    "password_reset_token" VARCHAR(255) NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
    "verification_token" VARCHAR(255),
    "invitation_token" VARCHAR(255),
    "password_reset_token_expires_at" TIMESTAMPTZ NULL,
    "email_verified_at" TIMESTAMPTZ,
    "phone_verified_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

CREATE INDEX ON "users" ("tenant_id");

CREATE INDEX ON "users" ("email");

CREATE INDEX ON "users" ("password_reset_token");

create table tokens (
    token_key VARCHAR(255) NOT NULL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    refresh_token VARCHAR(255) REFERENCES tokens,
    token_type VARCHAR(50),
    expiration TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Bảng permissions (quyền)
CREATE TABLE "permissions" (
    "id" BIGSERIAL PRIMARY KEY,
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now())
);

-- Bảng roles (vai trò)
CREATE TABLE "roles" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
    UNIQUE ("tenant_id", "name")
);

-- Bảng trung gian role_permissions
CREATE TABLE "role_permissions" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    PRIMARY KEY ("role_id", "permission_id"),
    FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE
);

-- Bảng trung gian user_roles
CREATE TABLE "user_roles" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    PRIMARY KEY ("user_id", "role_id"),
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE
);

-- Bảng Audit Logs
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "action" VARCHAR(255) NOT NULL,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL
);

CREATE INDEX ON "audit_logs" ("tenant_id");

CREATE INDEX ON "audit_logs" ("user_id");

CREATE INDEX ON "audit_logs" ("action");

CREATE INDEX ON "audit_logs" ("timestamp");

-- Bảng Subscriptions
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "plan_id" BIGINT NOT NULL,
    "status" VARCHAR(50) NOT NULL, -- e.g., active, canceled, past_due
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ,
    "trial_end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE RESTRICT
);

CREATE INDEX ON "subscriptions" ("tenant_id");

CREATE INDEX ON "subscriptions" ("status");

-- Bảng Alerts
CREATE TABLE "alerts" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "type" VARCHAR(100) NOT NULL, -- e.g., 'unusual_login', 'high_failed_attempts'
    "severity" VARCHAR(50) NOT NULL, -- e.g., 'low', 'medium', 'high', 'critical'
    "description" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

CREATE INDEX ON "alerts" ("tenant_id");

CREATE INDEX ON "alerts" ("type");

CREATE INDEX ON "alerts" ("severity");

CREATE INDEX ON "alerts" ("is_read");