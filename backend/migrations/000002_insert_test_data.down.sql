-- Truncate all tables with test data to reset the state
-- Using TRUNCATE ... RESTART IDENTITY to reset auto-incrementing keys
-- Using CASCADE to automatically truncate dependent tables

TRUNCATE TABLE
    plans,
    permissions,
    tenants,
    users,
    roles,
    role_permissions,
    user_roles,
    service_roles,
    sessions,
    sso_configs,
    subscriptions,
    requests,
    audit_logs,
    alerts,
    integrations,
    tokens,
    webhooks,
    tickets,
    ticket_replies
RESTART IDENTITY CASCADE;
