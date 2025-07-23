CREATE TABLE "permissions" (
    "id" BIGSERIAL PRIMARY KEY,
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now())
);

CREATE TABLE "roles" (
    "id" BIGSERIAL PRIMARY KEY,
    "tenant_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (now()),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
    UNIQUE("tenant_id", "name")
);

CREATE TABLE "role_permissions" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    PRIMARY KEY ("role_id", "permission_id"),
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
    FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
);

CREATE TABLE "user_roles" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    PRIMARY KEY ("user_id", "role_id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
);

-- Seed default permissions
INSERT INTO "permissions" ("key", "description") VALUES
('users:create', 'Create new users'),
('users:read', 'Read user information'),
('users:update', 'Update user information'),
('users:delete', 'Delete users'),
('roles:create', 'Create new roles'),
('roles:read', 'Read role information'),
('roles:update', 'Update role information'),
('roles:delete', 'Delete roles'),
('billing:read', 'Read billing information'),
('tenant:update', 'Update tenant settings');
