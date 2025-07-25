-- Tệp này chỉ chứa các lệnh INSERT để chèn dữ liệu thử nghiệm vào cơ sở dữ liệu.

-- Chèn dữ liệu ban đầu cho plans
INSERT INTO "plans" ( "name", "description", "price", "user_quota")
VALUES
( 'Free', 'Free plan with basic features', 0.00, 5 ),
('Startup','For small teams',29.00,20);

-- Chèn dữ liệu ban đầu cho permissions
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

-- Chèn System Tenant
INSERT INTO "tenants" ("plan_id", "name", "status", "key", "allow_public_signup", "user_quota", "is_onboarded") VALUES
((SELECT id FROM "plans" WHERE name = 'Startup'), 'System Tenant', 'active', 'A7153092-3E67-42AF-BC6D-931FE5CC1419', FALSE, 1, TRUE);

-- Chèn Super Admin user
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE key = 'A7153092-3E67-42AF-BC6D-931FE5CC1419'), 'superadmin@example.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'Super Admin', 'active', NOW());

-- Chèn các tenant mẫu
INSERT INTO "tenants" ("plan_id", "name", "status", "key", "allow_public_signup", "user_quota", "is_onboarded") VALUES
((SELECT id FROM "plans" WHERE name = 'Startup'), 'Tenant A', 'active', 'D7440E42-6698-424C-BF94-823437158A59', TRUE, 20, FALSE),
((SELECT id FROM "plans" WHERE name = 'Free'), 'Tenant B', 'active', '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5', FALSE, 5, FALSE);

-- Chèn user mẫu cho Tenant A
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'admin@a.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'Admin A', 'active', NOW()),
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'user@a.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'User A', 'active', NOW());

-- Chèn user mẫu cho Tenant B
INSERT INTO "users" ("tenant_id", "email", "password_hash", "name", "status", "email_verified_at") VALUES
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'admin@b.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'Admin B', 'active', NOW()),
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'user@b.com', '$2a$14$0lLKwuIYFYUAGv/Gt8pEmuV5JfZsS4DzMmqIVhrtYASzH4SqBakEK', 'User B', 'active', NOW());

-- Chèn các vai trò (roles)
INSERT INTO "roles" ("tenant_id", "name", "description", "is_default") VALUES
((SELECT id FROM "tenants" WHERE key = 'A7153092-3E67-42AF-BC6D-931FE5CC1419'), 'Super Admin', 'System-wide administrator with full access', TRUE),
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'Tenant A Admin', 'Administrator role for Tenant A', TRUE),
((SELECT id FROM "tenants" WHERE key = 'D7440E42-6698-424C-BF94-823437158A59'), 'Tenant A Member', 'Member role for Tenant A', FALSE),
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'Tenant B Admin', 'Administrator role for Tenant B', TRUE),
((SELECT id FROM "tenants" WHERE key = '6E31D6DE-D015-43B8-A8F8-0CFBF48BE8A5'), 'Tenant B Member', 'Member role for Tenant B', FALSE);

-- Gán quyền cho vai trò
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT (SELECT id FROM "roles" WHERE name = 'Super Admin'), id FROM "permissions";
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT (SELECT id FROM "roles" WHERE name = 'Tenant A Admin'), id FROM "permissions";
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT (SELECT id FROM "roles" WHERE name = 'Tenant A Member'), id FROM "permissions" WHERE key = 'users:read';
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT (SELECT id FROM "roles" WHERE name = 'Tenant B Admin'), id FROM "permissions";
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT (SELECT id FROM "roles" WHERE name = 'Tenant B Member'), id FROM "permissions" WHERE key = 'users:read';

-- Gán vai trò cho người dùng
INSERT INTO "user_roles" ("user_id", "role_id") VALUES
((SELECT id FROM "users" WHERE email = 'superadmin@example.com'), (SELECT id FROM "roles" WHERE name = 'Super Admin')),
((SELECT id FROM "users" WHERE email = 'admin@a.com'), (SELECT id FROM "roles" WHERE name = 'Tenant A Admin')),
((SELECT id FROM "users" WHERE email = 'user@a.com'), (SELECT id FROM "roles" WHERE name = 'Tenant A Member')),
((SELECT id FROM "users" WHERE email = 'admin@b.com'), (SELECT id FROM "roles" WHERE name = 'Tenant B Admin')),
((SELECT id FROM "users" WHERE email = 'user@b.com'), (SELECT id FROM "roles" WHERE name = 'Tenant B Member'));