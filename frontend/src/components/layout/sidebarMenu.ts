import React from 'react';
import { FaTachometerAlt, FaChartLine, FaUserShield, FaBell, FaExclamationTriangle, FaBuilding, FaInbox, FaUsers, FaUserTag, FaCubes, FaKey, FaLock, FaShieldAlt, FaGavel, FaUserCheck, FaExchangeAlt, FaClipboardList, FaUserClock, FaTicketAlt, FaPuzzlePiece, FaPlug, FaFileInvoiceDollar, FaCreditCard, FaCog } from 'react-icons/fa';

interface MenuItem {
  labelKey: string; // Key for translation
  href: string;
  icon: React.ElementType;
  dataPage: string;
  permissions?: string[]; // Optional: permissions required to view this item
}

interface MenuSection {
  titleKey: string; // Key for translation
  items: MenuItem[];
}

export const sidebarMenu: MenuSection[] = [
  {
    titleKey: 'dashboard',
    items: [
      { labelKey: 'sidebar.overview', href: '/dashboard/overview', icon: FaTachometerAlt, dataPage: 'overview', permissions: [] },
      { labelKey: 'sidebar.analytics', href: '/dashboard/analytics', icon: FaChartLine, dataPage: 'analytics', permissions: ['analytics:read'] },
    ],
  },
  {
    titleKey: 'sidebar.monitoring',
    items: [
      { labelKey: 'sidebar.securityDashboard', href: '/dashboard/security-dashboard', icon: FaUserShield, dataPage: 'security-dashboard', permissions: ['security:read'] },
      { labelKey: 'sidebar.alerts', href: '/dashboard/alerts', icon: FaBell, dataPage: 'alerts', permissions: ['alerts:read'] },
      { labelKey: 'sidebar.accessKeyAlerts', href: '/dashboard/access-key-alerts', icon: FaExclamationTriangle, dataPage: 'access-key-alerts', permissions: ['access_keys:read'] },
    ],
  },
  {
    titleKey: 'sidebar.identity',
    items: [
      { labelKey: 'sidebar.tenantManager', href: '/dashboard/tenant-manager', icon: FaBuilding, dataPage: 'tenant-manager', permissions: ['tenant:read'] },
      { labelKey: 'sidebar.requestManagement', href: '/dashboard/request-management', icon: FaInbox, dataPage: 'request-management', permissions: ['requests:read'] },
      { labelKey: 'sidebar.users', href: '/dashboard/users', icon: FaUsers, dataPage: 'users', permissions: ['users:read'] },
      { labelKey: 'sidebar.roles', href: '/dashboard/roles', icon: FaUserTag, dataPage: 'roles', permissions: ['roles:read'] },
      { labelKey: 'sidebar.applications', href: '/dashboard/applications', icon: FaCubes, dataPage: 'applications', permissions: ['applications:read'] },
      { labelKey: 'sidebar.accessKeys', href: '/dashboard/access-keys', icon: FaKey, dataPage: 'access-keys', permissions: ['access_keys:read'] },
      { labelKey: 'sidebar.serviceRoles', href: '/dashboard/service-roles', icon: FaUserShield, dataPage: 'service-roles', permissions: ['service_roles:read'] },
      { labelKey: 'sidebar.permissions', href: '/dashboard/permissions', icon: FaLock, dataPage: 'permissions', permissions: ['permissions:read'] },
    ],
  },
  {
    titleKey: 'sidebar.security',
    items: [
      { labelKey: 'sidebar.mfaSettings', href: '/dashboard/mfa-settings', icon: FaShieldAlt, dataPage: 'mfa-settings', permissions: ['users:update'] },
      { labelKey: 'sidebar.policyConfig', href: '/dashboard/policy-config', icon: FaGavel, dataPage: 'policy-config', permissions: ['policies:read'] },
      { labelKey: 'sidebar.policySimulator', href: '/dashboard/policy-simulator', icon: FaUserCheck, dataPage: 'policy-simulator', permissions: ['policies:simulate'] },
      { labelKey: 'sidebar.ssoIntegration', href: '/dashboard/sso-integration', icon: FaExchangeAlt, dataPage: 'sso-integration', permissions: ['sso:read'] },
      { labelKey: 'sidebar.auditLogs', href: '/dashboard/audit-logs', icon: FaClipboardList, dataPage: 'audit-logs', permissions: ['audit-logs:read'] },
      { labelKey: 'sidebar.sessionManagement', href: '/dashboard/session-management', icon: FaUserClock, dataPage: 'session-management', permissions: ['sessions:read'] },
    ],
  },
  {
    titleKey: 'sidebar.report',
    items: [
      { labelKey: 'sidebar.supportTickets', href: '/dashboard/support-tickets', icon: FaTicketAlt, dataPage: 'support-tickets', permissions: ['tickets:read'] },
    ],
  },
  {
    titleKey: 'sidebar.settings',
    items: [
      { labelKey: 'sidebar.integrations', href: '/dashboard/integrations', icon: FaPuzzlePiece, dataPage: 'integrations', permissions: ['integrations:read'] },
      { labelKey: 'sidebar.webhooks', href: '/dashboard/webhooks', icon: FaPlug, dataPage: 'webhooks', permissions: ['webhooks:read'] },
      { labelKey: 'sidebar.plans', href: '/dashboard/plans', icon: FaFileInvoiceDollar, dataPage: 'plans', permissions: ['plans:read'] },
      { labelKey: 'sidebar.subscriptions', href: '/dashboard/subscriptions', icon: FaCreditCard, dataPage: 'subscriptions', permissions: ['subscriptions:read'] },
      { labelKey: 'sidebar.billing', href: '/dashboard/billing', icon: FaFileInvoiceDollar, dataPage: 'billing', permissions: ['billing:read'] },
      { labelKey: 'sidebar.tenantSettings', href: '/dashboard/tenant-settings', icon: FaCog, dataPage: 'tenant-settings', permissions: ['tenant:read'] },
    ],
  },
];
