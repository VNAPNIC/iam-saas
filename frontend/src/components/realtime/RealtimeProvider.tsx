"use client";

import { useEffect, ReactNode } from 'react';
import { useWebSocket, useTenantConfigurationUpdates } from '@/hooks/useWebSocket';
import { useTenantStore } from '@/stores/tenantStore';
// import { useToast } from '@/components/ui/use-toast';

interface RealtimeContextType {
  isConnected: boolean;
  isConnecting: boolean;
}

// const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  // const { toast } = useToast();
  const toast = (options: any) => {};
  const { setTenantConfig } = useTenantStore();
  const configUpdates = useTenantConfigurationUpdates();

  const { isConnected, isConnecting } = useWebSocket({
    onConnect: () => {
      console.log('Real-time connection established');
      toast({
        title: "Connected",
        description: "Real-time updates are now active",
        duration: 3000,
      });
    },
    onDisconnect: () => {
      console.log('Real-time connection lost');
      toast({
        title: "Disconnected",
        description: "Real-time updates are temporarily unavailable",
        variant: "destructive",
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Real-time connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish real-time connection",
        variant: "destructive",
        duration: 5000,
      });
    },
    onMessage: (message) => {
      // Handle different message types
      switch (message.type) {
        case 'TENANT_BRANDING_UPDATED':
          toast({
            title: "Configuration Updated",
            description: "Tenant branding has been updated",
            duration: 3000,
          });
          break;
        case 'TENANT_EMAIL_SETTINGS_UPDATED':
          toast({
            title: "Email Settings Updated",
            description: "Email configuration has been updated",
            duration: 3000,
          });
          break;
        case 'TENANT_PASSWORD_POLICY_UPDATED':
          toast({
            title: "Password Policy Updated",
            description: "Password policy has been updated",
            duration: 3000,
          });
          break;
        case 'TENANT_DOMAIN_UPDATED':
          toast({
            title: "Domain Updated",
            description: "Tenant domain has been updated",
            duration: 3000,
          });
          break;
        case 'SECURITY_ALERT':
          toast({
            title: "Security Alert",
            description: message.data.message || "Security event detected",
            variant: "destructive",
            duration: 10000,
          });
          break;
        case 'USER_PERMISSIONS_UPDATED':
          toast({
            title: "Permissions Updated",
            description: "Your permissions have been updated",
            duration: 5000,
          });
          // Trigger a refresh of user permissions
          window.location.reload();
          break;
      }
    }
  });

  // Update tenant configuration when real-time updates are received
  useEffect(() => {
    if (configUpdates) {
      // Update the tenant store with new configuration
      if (configUpdates.branding) {
        const newConfig = {
          name: '',
          logoUrl: configUpdates.branding.logo_url || null,
          primaryColor: configUpdates.branding.primary_color || null,
          isOnboarded: configUpdates.branding.is_onboarded || false,
        };
        setTenantConfig(newConfig);
      }
    }
  }, [configUpdates, setTenantConfig]);

  const contextValue = {
    isConnected,
    isConnecting,
  };

  return (
    <div>
      {children}
    </div>
  );
};

export const useRealtime = () => {
  // const context = useContext(RealtimeContext);
  // if (context === undefined) {
  //   throw new Error('useRealtime must be used within a RealtimeProvider');
  // }
  // return context;
  return {
    isConnected: false,
    isConnecting: false
  };
};