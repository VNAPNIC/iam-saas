CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng chứa các gói dịch vụ (plans) mà một tenant có thể đăng ký
CREATE TABLE "plans" (
    "id" BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "user_quota" INT NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng chính chứa thông tin về các khách hàng (tenants)
CREATE TABLE "tenants" (
    "id" BIGSERIAL PRIMARY KEY,
    "plan_id" BIGINT,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending_verification', -- e.g., pending_verification, active, suspended
    "logo_url" VARCHAR(255),
    "primary_color" VARCHAR(7),
    "allow_public_signup" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_quota" INT NOT NULL DEFAULT 5,
    key UUID UNIQUE DEFAULT gen_random_uuid(),
    is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE SET NULL
);

CREATE INDEX ON "tenants" ("status");

-- Bảng chứa thông tin người dùng, thuộc về một tenant cụ thể
CREATE TABLE "users" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
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

-- Bảng chứa các quyền (permissions) trong hệ thống
CREATE TABLE "permissions" (
    "id" BIGSERIAL PRIMARY KEY,
    "key" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT
);

-- Bảng chứa các vai trò (roles)
CREATE TABLE "roles" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT, -- NULL cho các vai trò hệ thống (Super Admin, Tenant Admin)
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

CREATE INDEX ON "roles" ("tenant_id");

-- Bảng trung gian gán quyền cho vai trò (Many-to-Many)
CREATE TABLE "role_permissions" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    PRIMARY KEY ("role_id", "permission_id"),
    FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE
);

-- Bảng trung gian gán vai trò cho người dùng (Many-to-Many)
CREATE TABLE "user_roles" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    PRIMARY KEY ("user_id", "role_id"),
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- Chèn dữ liệu ban đầu cho plans, permissions và các vai trò hệ thống
INSERT INTO "plans" (  "name", "description", "price", "user_quota")
VALUES 
( 'Free', 'Free plan with basic features', 0.00, 5 ),
('Startup','For small teams',29.00,20);

INSERT INTO "permissions" ("action","resource","description")
VALUES 
('create','users','Allow creating new users'),
('read','users','Allow reading user information'),
('update','users','Allow updating user information'),
('delete','users','Allow deleting users');