-- Insert comprehensive test data for IAM SaaS system

-- ============================================================================
-- PLANS
-- ============================================================================
INSERT INTO plans (name, description, price, billing_cycle, max_users, max_roles, max_permissions, features, is_active) VALUES
('Free', 'For personal projects and trials', 0.00, 'monthly', 5, 3, 20, '["Basic user management", "Limited roles", "Email support"]', true),
('Startup', 'For small teams and startups', 49.00, 'monthly', 25, 10, 100, '["Full user management", "Custom roles", "Audit logs", "Priority email support"]', true),
('Business', 'For growing businesses', 199.00, 'monthly', 100, 50, 500, '["Startup features", "SSO integration", "API access", "Phone support"]', true),
('Enterprise', 'For large organizations', 999.00, 'yearly', 1000, 200, 2000, '["Business features", "SCIM provisioning", "Advanced security", "Dedicated account manager"]', true),
('Legacy', 'Old plan, no new signups', 29.00, 'monthly', 20, 5, 50, '[]', false);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
INSERT INTO permissions (key, description) VALUES
-- User Management
('users:create', 'Allows creating new users'),
('users:read', 'Allows viewing user profiles and lists'),
('users:update', 'Allows updating user information'),
('users:delete', 'Allows deleting users'),
('users:impersonate', 'Allows logging in as another user'),
-- Role & Permission Management
('roles:create', 'Allows creating new roles'),
('roles:read', 'Allows viewing roles and their permissions'),
('roles:update', 'Allows updating roles and assigning permissions'),
('roles:delete', 'Allows deleting roles'),
('permissions:read', 'Allows viewing available permissions'),
-- Tenant Settings
('tenant:read', 'Allows viewing tenant settings'),
('tenant:update', 'Allows updating tenant settings (name, logo, etc.)'),
-- SSO & Integrations
('sso:read', 'Allows viewing SSO configuration'),
('sso:update', 'Allows creating and updating SSO configuration'),
('integrations:read', 'Allows viewing third-party integrations'),
('integrations:update', 'Allows creating and updating integrations'),
('webhooks:read', 'Allows viewing webhooks'),
('webhooks:update', 'Allows creating and updating webhooks'),
-- Security & Auditing
('audit-logs:read', 'Allows viewing audit logs'),
('security:read', 'Allows viewing security dashboards and alerts'),
('security:update', 'Allows managing security settings (e.g., password policy)'),
('sessions:read', 'Allows viewing active user sessions'),
('sessions:delete', 'Allows revoking user sessions'),
-- Billing & Subscriptions
('billing:read', 'Allows viewing billing history and invoices'),
('billing:update', 'Allows updating payment methods and subscription plans'),
-- Support
('tickets:create', 'Allows creating support tickets'),
('tickets:read', 'Allows viewing support tickets'),
('tickets:update', 'Allows replying to and managing support tickets'),
-- Super Admin
('super:admin', 'Grants all permissions across the system');

-- ============================================================================
-- TENANTS & SUBSCRIPTIONS
-- ============================================================================
-- Tenant 1: Acme Corp (Active, Business Plan)
INSERT INTO tenants (key, name, domain, domain_verified, logo_url, primary_color, allow_public_signup, plan_id, status, user_quota, is_onboarded) VALUES
('acme-corp-key', 'Acme Corporation', 'acme.com', true, 'https://example.com/logos/acme.png', '#FF5733', false, (SELECT id FROM plans WHERE name = 'Business'), 'active', 100, true);
INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, current_period_start, current_period_end) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM plans WHERE name = 'Business'), 'active', NOW() - INTERVAL '60 days', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days');

-- Tenant 2: Innovate LLC (Active, Startup Plan)
INSERT INTO tenants (key, name, domain, domain_verified, logo_url, primary_color, allow_public_signup, plan_id, status, user_quota, is_onboarded) VALUES
('innovate-llc-key', 'Innovate LLC', 'innovate.io', true, 'https://example.com/logos/innovate.png', '#33AFFF', true, (SELECT id FROM plans WHERE name = 'Startup'), 'active', 25, true);
INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, current_period_start, current_period_end, trial_end) VALUES
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), (SELECT id FROM plans WHERE name = 'Startup'), 'trialing', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days');

-- Tenant 3: Globex Inc (Suspended, Startup Plan)
INSERT INTO tenants (key, name, domain, domain_verified, logo_url, primary_color, allow_public_signup, plan_id, status, user_quota, is_onboarded) VALUES
('globex-inc-key', 'Globex Inc', 'globex.dev', false, NULL, '#8E44AD', false, (SELECT id FROM plans WHERE name = 'Startup'), 'suspended', 25, true);
INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, current_period_start, current_period_end) VALUES
((SELECT id FROM tenants WHERE key = 'globex-inc-key'), (SELECT id FROM plans WHERE name = 'Startup'), 'past_due', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days');

-- Tenant 4: Solo Dev (Active, Free Plan)
INSERT INTO tenants (key, name, domain, domain_verified, logo_url, primary_color, allow_public_signup, plan_id, status, user_quota, is_onboarded) VALUES
('solo-dev-key', 'Solo Dev', NULL, false, NULL, '#2563EB', true, (SELECT id FROM plans WHERE name = 'Free'), 'active', 5, true);
INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, current_period_start, current_period_end) VALUES
((SELECT id FROM tenants WHERE key = 'solo-dev-key'), (SELECT id FROM plans WHERE name = 'Free'), 'active', NOW() - INTERVAL '100 days', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days');

-- Tenant 5: Pending Co (Pending, Free Plan)
INSERT INTO tenants (key, name, plan_id, status, user_quota, is_onboarded) VALUES
('pending-co-key', 'Pending Co', (SELECT id FROM plans WHERE name = 'Free'), 'pending', 5, false);

-- ============================================================================
-- USERS
-- ============================================================================
-- Users for Acme Corp
INSERT INTO users (tenant_id, email, password_hash, name, avatar_url, status, email_verified_at, mfa_enabled) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'admin@acme.com', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Alice Admin', 'https://i.pravatar.cc/150?u=admin@acme.com', 'active', NOW(), true),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'manager@acme.com', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Bob Manager', 'https://i.pravatar.cc/150?u=manager@acme.com', 'active', NOW(), true),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'dev@acme.com', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Charlie Developer', 'https://i.pravatar.cc/150?u=dev@acme.com', 'active', NOW(), false),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'support@acme.com', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Diana Support', 'https://i.pravatar.cc/150?u=support@acme.com', 'active', NOW(), false),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'pending@acme.com', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Peter Pending', 'https://i.pravatar.cc/150?u=pending@acme.com', 'pending', NULL, false);

-- Users for Innovate LLC
INSERT INTO users (tenant_id, email, password_hash, name, avatar_url, status, email_verified_at, mfa_enabled) VALUES
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), 'admin@innovate.io', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Eve Admin', 'https://i.pravatar.cc/150?u=admin@innovate.io', 'active', NOW(), false),
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), 'member@innovate.io', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Frank Member', 'https://i.pravatar.cc/150?u=member@innovate.io', 'active', NOW(), false);

-- ============================================================================
-- ROLES & PERMISSIONS
-- ============================================================================
-- Roles for Acme Corp
INSERT INTO roles (tenant_id, name, description, is_default) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'Administrator', 'Full access to all tenant resources', true),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'Manager', 'Can manage users and roles', false),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'Developer', 'Can manage integrations and webhooks', false),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'Support', 'Can manage support tickets', false),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'Read Only', 'Can view all resources but not edit', false);

-- Assign permissions to Acme roles
-- Administrator Role
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Administrator' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key')), id FROM permissions WHERE key NOT LIKE 'super:%';
-- Manager Role
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Manager' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key')), id FROM permissions WHERE key IN ('users:create', 'users:read', 'users:update', 'roles:create', 'roles:read', 'roles:update');
-- Developer Role
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Developer' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key')), id FROM permissions WHERE key IN ('integrations:read', 'integrations:update', 'webhooks:read', 'webhooks:update', 'audit-logs:read');
-- Support Role
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Support' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key')), id FROM permissions WHERE key IN ('tickets:create', 'tickets:read', 'tickets:update', 'users:read');
-- Read Only Role
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Read Only' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key')), id FROM permissions WHERE key LIKE '%:read';

-- Assign roles to Acme users
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'admin@acme.com'), (SELECT id FROM roles WHERE name = 'Administrator' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key'))),
((SELECT id FROM users WHERE email = 'manager@acme.com'), (SELECT id FROM roles WHERE name = 'Manager' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key'))),
((SELECT id FROM users WHERE email = 'dev@acme.com'), (SELECT id FROM roles WHERE name = 'Developer' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key'))),
((SELECT id FROM users WHERE email = 'support@acme.com'), (SELECT id FROM roles WHERE name = 'Support' AND tenant_id = (SELECT id FROM tenants WHERE key = 'acme-corp-key')));

-- Roles for Innovate LLC
INSERT INTO roles (tenant_id, name, description, is_default) VALUES
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), 'Admin', 'Full access', true),
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), 'Member', 'Basic access', false);

-- Assign permissions to Innovate roles
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Admin' AND tenant_id = (SELECT id FROM tenants WHERE key = 'innovate-llc-key')), id FROM permissions WHERE key NOT LIKE 'super:%' AND key NOT IN ('billing:update');
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Member' AND tenant_id = (SELECT id FROM tenants WHERE key = 'innovate-llc-key')), id FROM permissions WHERE key IN ('users:read', 'tickets:create', 'tickets:read');

-- Assign roles to Innovate users
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'admin@innovate.io'), (SELECT id FROM roles WHERE name = 'Admin' AND tenant_id = (SELECT id FROM tenants WHERE key = 'innovate-llc-key'))),
((SELECT id FROM users WHERE email = 'member@innovate.io'), (SELECT id FROM roles WHERE name = 'Member' AND tenant_id = (SELECT id FROM tenants WHERE key = 'innovate-llc-key')));

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
INSERT INTO audit_logs (tenant_id, user_id, user_email, ip_address, user_agent, event, resource_type, resource_id, status, severity, details) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'admin@acme.com'), 'admin@acme.com', '192.168.1.1', 'Chrome/120.0', 'user.login.success', 'user', (SELECT id FROM users WHERE email = 'admin@acme.com'), 'success', 'info', '{"method": "password"}'),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'admin@acme.com'), 'admin@acme.com', '192.168.1.1', 'Chrome/120.0', 'role.create', 'role', (SELECT id FROM roles WHERE name = 'Developer'), 'success', 'info', '{"name": "Developer"}'),
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'manager@acme.com'), 'manager@acme.com', '192.168.1.5', 'Firefox/119.0', 'user.update', 'user', (SELECT id FROM users WHERE email = 'dev@acme.com'), 'success', 'info', '{"changes": {"status": "active"}}'),
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), NULL, 'attacker@example.com', '10.20.30.40', 'curl/7.81.0', 'user.login.failure', 'user', NULL, 'failed', 'warning', '{"reason": "Invalid credentials"}'),
((SELECT id FROM tenants WHERE key = 'globex-inc-key'), NULL, NULL, '200.100.50.1', 'Internal Process', 'subscription.payment.failed', 'subscription', (SELECT id FROM subscriptions WHERE tenant_id = (SELECT id FROM tenants WHERE key = 'globex-inc-key')), 'failed', 'critical', '{"amount": 49.00, "reason": "Card declined"}');

-- ============================================================================
-- SESSIONS
-- ============================================================================
INSERT INTO sessions (user_id, tenant_id, refresh_token, device_info, ip_address, location, expires_at, is_active) VALUES
((SELECT id FROM users WHERE email = 'admin@acme.com'), (SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'acme-admin-token-1', '{"os": "macOS", "browser": "Chrome"}', '192.168.1.1', '{"country": "USA", "city": "New York"}', NOW() + INTERVAL '30 days', true),
((SELECT id FROM users WHERE email = 'manager@acme.com'), (SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'acme-manager-token-1', '{"os": "Windows", "browser": "Edge"}', '192.168.1.5', '{"country": "USA", "city": "Chicago"}', NOW() + INTERVAL '30 days', true),
((SELECT id FROM users WHERE email = 'admin@innovate.io'), (SELECT id FROM tenants WHERE key = 'innovate-llc-key'), 'innovate-admin-token-1', '{"os": "Linux", "browser": "Firefox"}', '8.8.8.8', '{"country": "USA", "city": "Mountain View"}', NOW() + INTERVAL '30 days', true),
((SELECT id FROM users WHERE email = 'admin@acme.com'), (SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'acme-admin-token-2-expired', '{"os": "iOS", "browser": "Safari"}', '1.1.1.1', '{"country": "Australia", "city": "Sydney"}', NOW() - INTERVAL '1 day', false);

-- ============================================================================
-- TICKETS & REPLIES
-- ============================================================================
-- Ticket 1
INSERT INTO tickets (tenant_id, user_id, title, description, priority, status, category, assigned_to) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'dev@acme.com'), 'Problem with Webhook Delivery', 'Our webhook endpoint is not receiving any POST requests for the user.created event.', 'high', 'open', 'technical', 'support-agent-1@example.com');
INSERT INTO ticket_replies (ticket_id, content, replier_email, is_internal) VALUES
(1, 'Hi Charlie, thanks for reaching out. I am investigating the issue with our engineering team and will get back to you shortly.', 'support-agent-1@example.com', false),
(1, 'Checked the logs. It seems to be a DNS resolution issue on their end. The endpoint URL is not resolving from our servers.', 'sys-admin@internal.com', true);

-- Ticket 2
INSERT INTO tickets (tenant_id, user_id, title, description, priority, status, category, assigned_to) VALUES
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), (SELECT id FROM users WHERE email = 'admin@innovate.io'), 'Question about billing', 'How can we upgrade our plan from Startup to Business?', 'low', 'resolved', 'billing', 'sales-rep-1@example.com');
INSERT INTO ticket_replies (ticket_id, content, replier_email, is_internal) VALUES
(2, 'Hi Eve, you can upgrade your plan directly from the "Billing" section in your tenant settings. Let me know if you need any help!', 'sales-rep-1@example.com', false),
(2, 'Customer has been contacted and guided through the upgrade process. Closing this ticket.', 'sales-rep-1@example.com', false);

-- ============================================================================
-- NEW TEST DATA
-- ============================================================================

-- Tenant 6: Quantum Leap Corp (Active, Enterprise Plan)
INSERT INTO tenants (key, name, domain, domain_verified, logo_url, primary_color, allow_public_signup, plan_id, status, user_quota, is_onboarded) VALUES
('quantum-leap-key', 'Quantum Leap Corp', 'quantum.tech', true, 'https://example.com/logos/quantum.png', '#9B59B6', false, (SELECT id FROM plans WHERE name = 'Enterprise'), 'active', 1000, true);

-- Additional test tenants for frontend testing
INSERT INTO tenants (key, name, domain, domain_verified, logo_url, primary_color, allow_public_signup, plan_id, status, user_quota, is_onboarded) VALUES
('quantum-leap', 'Quantum Leap', 'quantum-leap', false, NULL, '#E11D48', true, (SELECT id FROM plans WHERE name = 'Startup'), 'active', 50, true),
('smew', 'SMEW Technology Company Limited', 'smew', true, NULL, '#8B5CF6', true, (SELECT id FROM plans WHERE name = 'Business'), 'active', 200, true),
('test-corp', 'Test Corporation', 'test-corp', true, NULL, '#F59E0B', false, (SELECT id FROM plans WHERE name = 'Free'), 'active', 25, true);
INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, current_period_start, current_period_end) VALUES
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), (SELECT id FROM plans WHERE name = 'Enterprise'), 'active', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() + INTERVAL '355 days');

-- Users for Quantum Leap Corp
INSERT INTO users (tenant_id, email, password_hash, name, avatar_url, status, email_verified_at, mfa_enabled) VALUES
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), 'ceo@quantum.tech', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Grace Hopper', 'https://i.pravatar.cc/150?u=ceo@quantum.tech', 'active', NOW(), true),
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), 'sec-analyst@quantum.tech', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Sam Security', 'https://i.pravatar.cc/150?u=sec-analyst@quantum.tech', 'active', NOW(), true),
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), 'billing@quantum.tech', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Bill Manager', 'https://i.pravatar.cc/150?u=billing@quantum.tech', 'active', NOW(), false);

-- Suspended and additional user for Acme Corp
INSERT INTO users (tenant_id, email, password_hash, name, avatar_url, status, email_verified_at, mfa_enabled) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), 'suspended@acme.com', '$2a$12$RIg.e.d4Vz50xL9mNCp1i.whGfO0j2CgJdGo/aIqgqj5S0e.8l.d6', 'Susan Suspended', 'https://i.pravatar.cc/150?u=suspended@acme.com', 'suspended', NOW(), false);

-- Roles for Quantum Leap Corp
INSERT INTO roles (tenant_id, name, description, is_default) VALUES
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), 'Security Analyst', 'Can view security dashboards and audit logs', false),
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), 'Billing Manager', 'Can manage billing and subscriptions', false);

-- Assign permissions to Quantum Leap roles
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Security Analyst' AND tenant_id = (SELECT id FROM tenants WHERE key = 'quantum-leap-key')), id FROM permissions WHERE key IN ('security:read', 'audit-logs:read', 'sessions:read');
INSERT INTO role_permissions (role_id, permission_id) SELECT (SELECT id FROM roles WHERE name = 'Billing Manager' AND tenant_id = (SELECT id FROM tenants WHERE key = 'quantum-leap-key')), id FROM permissions WHERE key IN ('billing:read', 'billing:update', 'subscriptions:read');

-- Assign roles to Quantum Leap users
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'sec-analyst@quantum.tech'), (SELECT id FROM roles WHERE name = 'Security Analyst' AND tenant_id = (SELECT id FROM tenants WHERE key = 'quantum-leap-key'))),
((SELECT id FROM users WHERE email = 'billing@quantum.tech'), (SELECT id FROM roles WHERE name = 'Billing Manager' AND tenant_id = (SELECT id FROM tenants WHERE key = 'quantum-leap-key')));

-- More Audit Logs
INSERT INTO audit_logs (tenant_id, user_id, user_email, ip_address, user_agent, event, resource_type, resource_id, status, severity, details) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'admin@acme.com'), 'admin@acme.com', '192.168.1.1', 'Chrome/120.0', 'user.update.failure', 'user', (SELECT id FROM users WHERE email = 'dev@acme.com'), 'failed', 'warning', '{"error": "Permission denied"}'),
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), (SELECT id FROM users WHERE email = 'sec-analyst@quantum.tech'), 'sec-analyst@quantum.tech', '10.10.10.10', 'Custom-Security-Scanner/1.0', 'security.scan.completed', 'system', NULL, 'success', 'info', '{"vulnerabilities_found": 0}'),
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), NULL, 'cron-job', '127.0.0.1', 'Internal Process', 'integration.sync.failed', 'integration', 1, 'failed', 'error', '{"reason": "API endpoint timeout"}');

-- More Alerts
INSERT INTO alerts (tenant_id, user_id, type, event, message, description, severity, status, metadata) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'suspended@acme.com'), 'security', 'user.suspended', 'User account suspended', 'The account for suspended@acme.com has been manually suspended.', 'info', 'NEW', '{"reason": "Manual suspension by admin"}'),
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), NULL, 'security', 'suspicious.login.detected', 'Suspicious login from new location', 'A login was detected for ceo@quantum.tech from an unrecognized IP address (5.6.7.8) in a new country (Russia).', 'HIGH', 'NEW', '{"ip_address": "5.6.7.8", "country": "Russia"}'),
((SELECT id FROM tenants WHERE key = 'innovate-llc-key'), NULL, 'integration', 'integration.disabled', 'Integration disabled due to errors', 'The SCIM integration for Innovate LLC has been automatically disabled after 5 consecutive failures.', 'CRITICAL', 'ACKNOWLEDGED', '{"integration_id": 1, "failure_count": 5}');

-- More Tickets and Replies
-- Ticket 3
INSERT INTO tickets (tenant_id, user_id, title, description, priority, status, category, assigned_to) VALUES
((SELECT id FROM tenants WHERE key = 'acme-corp-key'), (SELECT id FROM users WHERE email = 'manager@acme.com'), 'Unable to delete user', 'I am trying to delete a user but I keep getting an error message.', 'medium', 'in_progress', 'technical', 'support-agent-2@example.com');
INSERT INTO ticket_replies (ticket_id, content, replier_email, is_internal) VALUES
(3, 'Hi Bob, which user are you trying to delete? Could you provide the email address?', 'support-agent-2@example.com', false);

-- Ticket 4
INSERT INTO tickets (tenant_id, user_id, title, description, priority, status, category, assigned_to) VALUES
((SELECT id FROM tenants WHERE key = 'quantum-leap-key'), (SELECT id FROM users WHERE email = 'ceo@quantum.tech'), 'Feature Request: Advanced Reporting', 'We would like to see more advanced reporting features, such as customizable dashboards and data exports.', 'medium', 'open', 'feature_request', 'product-manager@example.com');
