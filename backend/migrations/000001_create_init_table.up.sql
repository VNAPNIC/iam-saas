-- Kích hoạt extension để sử dụng UUID nếu cần (ví dụ cho id của plan)
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
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL
);
CREATE INDEX ON "tenants" ("status");

-- Bảng chứa thông tin người dùng, thuộc về một tenant cụ thể
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
    "tenant_id" UUID NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255),
    "avatar_url" TEXT,
    "phone_number" VARCHAR(20),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
    "email_verified_at" TIMESTAMPTZ,
    "phone_verified_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id")
);

CREATE INDEX ON "users" ("tenant_id");
CREATE INDEX ON "users" ("email");

-- Bảng chứa các quyền (permissions) trong hệ thống
CREATE TABLE "permissions" (
    "id" BIGSERIAL PRIMARY KEY,
    "action" VARCHAR(100) NOT NULL,  -- e.g., 'create', 'read', 'update', 'delete'
    "resource" VARCHAR(100) NOT NULL, -- e.g., 'users', 'products', 'settings'
    "description" TEXT,
    UNIQUE("action", "resource")
);

-- Bảng chứa các vai trò (roles)
CREATE TABLE "roles" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT, -- NULL cho các vai trò hệ thống (Super Admin, Tenant Admin)
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system_role" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
);
CREATE INDEX ON "roles" ("tenant_id");

-- Bảng trung gian gán quyền cho vai trò (Many-to-Many)
CREATE TABLE "role_permissions" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    PRIMARY KEY ("role_id", "permission_id"),
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
    FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
);

-- Bảng trung gian gán vai trò cho người dùng (Many-to-Many)
CREATE TABLE "user_roles" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    PRIMARY KEY ("user_id", "role_id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
);

-- Chèn dữ liệu ban đầu cho plans, permissions và các vai trò hệ thống
INSERT INTO "plans" ("name", "description", "price", "user_quota") VALUES
('Free', 'Free plan with basic features', 0.00, 5),
('Startup', 'For small teams', 29.00, 20);

INSERT INTO "permissions" ("action", "resource", "description") VALUES
('create', 'users', 'Allow creating new users'),
('read', 'users', 'Allow reading user information'),
('update', 'users', 'Allow updating user information'),
('delete', 'users', 'Allow deleting users');