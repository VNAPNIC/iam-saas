-- Drop all triggers
DROP TRIGGER IF EXISTS trigger_plans_updated_at ON plans;
DROP TRIGGER IF EXISTS trigger_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS trigger_permissions_updated_at ON permissions;
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS trigger_service_roles_updated_at ON service_roles;
DROP TRIGGER IF EXISTS trigger_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS trigger_sso_configs_updated_at ON sso_configs;
DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS trigger_requests_updated_at ON requests;
DROP TRIGGER IF EXISTS trigger_alerts_updated_at ON alerts;
DROP TRIGGER IF EXISTS trigger_integrations_updated_at ON integrations;
DROP TRIGGER IF EXISTS trigger_webhooks_updated_at ON webhooks;
DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON tickets;

-- Drop all tables
DROP TABLE IF EXISTS ticket_replies CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS sso_configs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS service_roles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
