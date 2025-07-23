-- Delete data from user_roles
DELETE FROM "user_roles"
WHERE user_id IN (
    SELECT id FROM "users" WHERE email IN ('admin.a@example.com', 'user.a@example.com', 'admin.b@example.com', 'user.b@example.com')
);

-- Delete data from role_permissions
DELETE FROM "role_permissions"
WHERE role_id IN (
    SELECT id FROM "roles" WHERE name IN ('Tenant A Admin', 'Tenant A Member', 'Tenant B Admin', 'Tenant B Member')
);

-- Delete data from roles
DELETE FROM "roles"
WHERE name IN ('Tenant A Admin', 'Tenant A Member', 'Tenant B Admin', 'Tenant B Member');

-- Delete data from users
DELETE FROM "users"
WHERE email IN ('admin.a@example.com', 'user.a@example.com', 'admin.b@example.com', 'user.b@example.com');

-- Delete data from tenants
DELETE FROM "tenants"
WHERE name IN ('Tenant A', 'Tenant B');