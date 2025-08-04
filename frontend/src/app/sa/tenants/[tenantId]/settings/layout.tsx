'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaCog, FaUsers, FaKey, FaShieldAlt, FaBell, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { tenantService } from '@/services/tenantService';

const TenantSettingsLayout = ({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) => {
  const pathname = usePathname();
  const [tenantId, setTenantId] = useState<string>('');
  const [tenantDomain, setTenantDomain] = useState('');
  
  // Extract tenantId from params
  useEffect(() => {
    params.then(({ tenantId: id }) => {
      setTenantId(id);
    });
  }, [params]);
  
  // Load tenant domain
  useEffect(() => {
    if (!tenantId) return;
    
    const loadTenantDomain = async () => {
      try {
        const response = await tenantService.getTenantDetails(tenantId);
        setTenantDomain(response.data.domain || `Tenant ${tenantId}`);
      } catch (error) {
        console.error('Failed to load tenant details', error);
        setTenantDomain(`Tenant ${tenantId}`);
      }
    };

    loadTenantDomain();
  }, [tenantId]);
  
  const navItems = [
    { name: 'General', href: `/sa/tenants/${tenantId}/settings`, icon: FaCog },
    { name: 'Email', href: `/sa/tenants/${tenantId}/settings/email`, icon: FaEnvelope },
    { name: 'Password Policy', href: `/sa/tenants/${tenantId}/settings/password-policy`, icon: FaLock },
    { name: 'Domain', href: `/sa/tenants/${tenantId}/settings/domain`, icon: FaGlobe },
    { name: 'Users', href: `/sa/tenants/${tenantId}/users`, icon: FaUsers },
    { name: 'Roles', href: `/sa/tenants/${tenantId}/roles`, icon: FaKey },
    { name: 'Permissions', href: `/sa/tenants/${tenantId}/permissions`, icon: FaShieldAlt },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Settings for {tenantDomain}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default TenantSettingsLayout;