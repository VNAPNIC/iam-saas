-- Insert sample tenants
INSERT INTO "tenants" ("plan_id", "name", "status", "allow_public_signup", "user_quota") VALUES
((SELECT id FROM "plans" WHERE name = 'Startup'), 'Tenant A', 'active', TRUE, 20),
((SELECT id FROM "plans" WHERE name = 'Free'), 'Tenant B', 'active', FALSE, 5);

-- Insert sample users for Tenant A
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE name = 'Tenant A'), 'admin@a.com', '$2a$14$M1EXcnMdj8XjFBqfBs6RNeZnbdCbeXJb3Os9UMHDzgxav.MOYGopi', 'Admin A', 'active', NOW()),
((SELECT id FROM "tenants" WHERE name = 'Tenant A'), 'user@a.com', '$2a$14$M1EXcnMdj8XjFBqfBs6RNeZnbdCbeXJb3Os9UMHDzgxav.MOYGopi', 'User A', 'active', NOW());

-- Insert sample users for Tenant B
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE name = 'Tenant B'), 'admin@b.com', '$2a$14$M1EXcnMdj8XjFBqfBs6RNeZnbdCbeXJb3Os9UMHDzgxav.MOYGopi', 'Admin B', 'active', NOW()),
((SELECT id FROM "tenants" WHERE name = 'Tenant B'), 'user@b.com', '$2a$14$M1EXcnMdj8XjFBqfBs6RNeZnbdCbeXJb3Os9UMHDzgxav.MOYGopi', 'User B', 'active', NOW());

-- Insert tenant-specific roles for Tenant A
INSERT INTO "roles" ("tenant_id", "name", "description", "is_system_role") VALUES
((SELECT id FROM "tenants" WHERE name = 'Tenant A'), 'Tenant A Admin', 'Administrator role for Tenant A', FALSE),
((SELECT id FROM "tenants" WHERE name = 'Tenant A'), 'Tenant A Member', 'Member role for Tenant A', FALSE);

-- Insert tenant-specific roles for Tenant B
INSERT INTO "roles" ("tenant_id", "name", "description", "is_system_role") VALUES
((SELECT id FROM "tenants" WHERE name = 'Tenant B'), 'Tenant B Admin', 'Administrator role for Tenant B', FALSE),
((SELECT id FROM "tenants" WHERE name = 'Tenant B'), 'Tenant B Member', 'Member role for Tenant B', FALSE);

-- Assign permissions to roles (example: Tenant A Admin gets all existing permissions)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant A Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant A')),
    id
FROM "permissions";

-- Assign permissions to roles (example: Tenant A Member gets read users permission)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant A Member' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant A')),
    id
FROM "permissions" WHERE action = 'read' AND resource = 'users';

-- Assign permissions to roles (example: Tenant B Admin gets all existing permissions)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant B Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant B')),
    id
FROM "permissions";

-- Assign permissions to roles (example: Tenant B Member gets read users permission)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant B Member' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant B')),
    id
FROM "permissions" WHERE action = 'read' AND resource = 'users';

-- Assign roles to users
INSERT INTO "user_roles" ("user_id", "role_id") VALUES
((SELECT id FROM "users" WHERE email = 'admin@a.com'), (SELECT id FROM "roles" WHERE name = 'Tenant A Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant A'))),
((SELECT id FROM "users" WHERE email = 'user@a.com'), (SELECT id FROM "roles" WHERE name = 'Tenant A Member' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant A'))),
((SELECT id FROM "users" WHERE email = 'admin@b.com'), (SELECT id FROM "roles" WHERE name = 'Tenant B Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant B'))),
((SELECT id FROM "users" WHERE email = 'user@b.com'), (SELECT id FROM "roles" WHERE name = 'Tenant B Member' AND tenant_id = (SELECT id FROM "tenants" WHERE name = 'Tenant B')));