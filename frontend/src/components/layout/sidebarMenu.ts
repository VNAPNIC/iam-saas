import React from 'react';
import { FaTachometerAlt, FaChartLine, FaUserShield, FaBell, FaExclamationTriangle, FaBuilding, FaInbox, FaUsers, FaUserTag, FaCubes, FaKey, FaLock, FaShieldAlt, FaGavel, FaUserCheck, FaExchangeAlt, FaClipboardList, FaUserClock, FaTicketAlt, FaPuzzlePiece, FaPlug, FaFileInvoiceDollar, FaCreditCard, FaCog } from 'react-icons/fa';

interface MenuItem {
  labelKey: string; // Key for translation
  href: string;
  icon: React.ElementType;
  dataPage: string;
}

interface MenuSection {
  titleKey: string; // Key for translation
  items: MenuItem[];
}

export const sidebarMenu: MenuSection[] = [
  {
    titleKey: 'sidebar.dashboard',
    items: [
      { labelKey: 'sidebar.overview', href: '/dashboard/overview', icon: FaTachometerAlt, dataPage: 'overview' },
      { labelKey: 'sidebar.analytics', href: '/dashboard/analytics', icon: FaChartLine, dataPage: 'analytics' },
    ],
  },
  {
    titleKey: 'sidebar.monitoring',
    items: [
      { labelKey: 'sidebar.securityDashboard', href: '/dashboard/security-dashboard', icon: FaUserShield, dataPage: 'security-dashboard' },
      { labelKey: 'sidebar.alerts', href: '/dashboard/alerts', icon: FaBell, dataPage: 'alerts' },
      { labelKey: 'sidebar.accessKeyAlerts', href: '/dashboard/access-key-alerts', icon: FaExclamationTriangle, dataPage: 'access-key-alerts' },
    ],
  },
  {
    titleKey: 'sidebar.identity',
    items: [
      { labelKey: 'sidebar.tenantManager', href: '/dashboard/tenant-manager', icon: FaBuilding, dataPage: 'tenant-manager' },
      { labelKey: 'sidebar.requestManagement', href: '/dashboard/request-management', icon: FaInbox, dataPage: 'request-management' },
      { labelKey: 'sidebar.users', href: '/dashboard/users', icon: FaUsers, dataPage: 'users' },
      { labelKey: 'sidebar.roles', href: '/dashboard/roles', icon: FaUserTag, dataPage: 'roles' },
      { labelKey: 'sidebar.applications', href: '/dashboard/applications', icon: FaCubes, dataPage: 'applications' },
      { labelKey: 'sidebar.accessKeys', href: '/dashboard/access-keys', icon: FaKey, dataPage: 'access-keys' },
      { labelKey: 'sidebar.serviceRoles', href: '/dashboard/service-roles', icon: FaUserShield, dataPage: 'service-roles' },
      { labelKey: 'sidebar.permissions', href: '/dashboard/permissions', icon: FaLock, dataPage: 'permissions' },
    ],
  },
  {
    titleKey: 'sidebar.security',
    items: [
      { labelKey: 'sidebar.mfaSettings', href: '/dashboard/mfa-settings', icon: FaShieldAlt, dataPage: 'mfa-settings' },
      { labelKey: 'sidebar.policyConfig', href: '/dashboard/policy-config', icon: FaGavel, dataPage: 'policy-config' },
      { labelKey: 'sidebar.policySimulator', href: '/dashboard/policy-simulator', icon: FaUserCheck, dataPage: 'policy-simulator' },
      { labelKey: 'sidebar.ssoIntegration', href: '/dashboard/sso-integration', icon: FaExchangeAlt, dataPage: 'sso-integration' },
      { labelKey: 'sidebar.auditLogs', href: '/dashboard/audit-logs', icon: FaClipboardList, dataPage: 'audit-logs' },
      { labelKey: 'sidebar.sessionManagement', href: '/dashboard/session-management', icon: FaUserClock, dataPage: 'session-management' },
    ],
  },
  {
    titleKey: 'sidebar.report',
    items: [
      { labelKey: 'sidebar.supportTickets', href: '/dashboard/support-tickets', icon: FaTicketAlt, dataPage: 'support-tickets' },
    ],
  },
  {
    titleKey: 'sidebar.settings',
    items: [
      { labelKey: 'sidebar.integrations', href: '/dashboard/integrations', icon: FaPuzzlePiece, dataPage: 'integrations' },
      { labelKey: 'sidebar.webhooks', href: '/dashboard/webhooks', icon: FaPlug, dataPage: 'webhooks' },
      { labelKey: 'sidebar.plans', href: '/dashboard/plans', icon: FaFileInvoiceDollar, dataPage: 'plans' },
      { labelKey: 'sidebar.subscriptions', href: '/dashboard/subscriptions', icon: FaCreditCard, dataPage: 'subscriptions' },
      { labelKey: 'sidebar.billing', href: '/dashboard/billing', icon: FaFileInvoiceDollar, dataPage: 'billing' },
      { labelKey: 'sidebar.tenantSettings', href: '/dashboard/tenant-settings', icon: FaCog, dataPage: 'tenant-settings' },
    ],
  },
];
