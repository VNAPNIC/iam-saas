-- Insert System Tenant
INSERT INTO "tenants" ("plan_id", "name", "status", "key", "allow_public_signup", "user_quota", "is_onboarded") VALUES
((SELECT id FROM "plans" WHERE name = 'Startup'), 'System Tenant', 'active', 'A7153092-3E67-42AF-BC6D-931FE5CC1419', FALSE, 1, TRUE);

-- Insert Super Admin user, associated with the System Tenant
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE key = 'A7153092-3E67-42AF-BC6D-931FE5CC1419'), 'superadmin@example.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'Super Admin', 'active', NOW());

-- Insert sample tenants
INSERT INTO "tenants" ("plan_id", "name", "status", "key", "allow_public_signup", "user_quota", "is_onboarded") VALUES
((SELECT id FROM "plans" WHERE name = 'Startup'), 'Tenant A', 'active', 'D7440E42-6698-424C-BF94-823437158A59', TRUE, 20, FALSE),
((SELECT id FROM "plans" WHERE name = 'Free'), 'Tenant B', 'active', '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5', FALSE, 5, FALSE);

-- Insert sample users for Tenant A
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'admin@a.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'Admin A', 'active', NOW()),
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'user@a.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'User A', 'active', NOW());

-- Insert sample users for Tenant B
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'admin@b.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'Admin B', 'active', NOW()),
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'user@b.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'User B', 'active', NOW());

-- Insert system roles (Super Admin)
INSERT INTO "roles" ("tenant_id", "name", "description", "is_system_role") VALUES
((SELECT id FROM "tenants" WHERE key = 'A7153092-3E67-42AF-BC6D-931FE5CC1419'), 'Super Admin', 'System-wide administrator with full access', TRUE);

-- Insert tenant-specific roles for Tenant A
INSERT INTO "roles" ("tenant_id", "name", "description", "is_system_role") VALUES
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'Tenant A Admin', 'Administrator role for Tenant A', FALSE),
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'Tenant A Member', 'Member role for Tenant A', FALSE);

-- Insert tenant-specific roles for Tenant B
INSERT INTO "roles" ("tenant_id", "name", "description", "is_system_role") VALUES
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'Tenant B Admin', 'Administrator role for Tenant B', FALSE),
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'Tenant B Member', 'Member role for Tenant B', FALSE);

-- Assign permissions to roles (example: Super Admin gets all existing permissions)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Super Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE key = 'A7153092-3E67-42AF-BC6D-931FE5CC1419')),
    id
FROM "permissions";

-- Assign permissions to roles (example: Tenant A Admin gets all existing permissions)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant A Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59')),
    id
FROM "permissions";

-- Assign permissions to roles (example: Tenant A Member gets read users permission)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant A Member' AND tenant_id = (SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59')),
    id
FROM "permissions" WHERE action = 'read' AND resource = 'users';

-- Assign permissions to roles (example: Tenant B Admin gets all existing permissions)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant B Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5')),
    id
FROM "permissions";

-- Assign permissions to roles (example: Tenant B Member gets read users permission)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT
    (SELECT id FROM "roles" WHERE name = 'Tenant B Member' AND tenant_id = (SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5')),
    id
FROM "permissions" WHERE action = 'read' AND resource = 'users';

-- Assign roles to users
INSERT INTO "user_roles" ("user_id", "role_id") VALUES
((SELECT id FROM "users" WHERE email = 'superadmin@example.com'), (SELECT id FROM "roles" WHERE name = 'Super Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE key = 'A7153092-3E67-42AF-BC6D-931FE5CC1419'))), -- <- CORRECTED LOOKUP
((SELECT id FROM "users" WHERE email = 'admin@a.com'), (SELECT id FROM "roles" WHERE name = 'Tenant A Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'))),
((SELECT id FROM "users" WHERE email = 'user@a.com'), (SELECT id FROM "roles" WHERE name = 'Tenant A Member' AND tenant_id = (SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'))),
((SELECT id FROM "users" WHERE email = 'admin@b.com'), (SELECT id FROM "roles" WHERE name = 'Tenant B Admin' AND tenant_id = (SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'))),
((SELECT id FROM "users" WHERE email = 'user@b.com'), (SELECT id FROM "roles" WHERE name = 'Tenant B Member' AND tenant_id = (SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5')));