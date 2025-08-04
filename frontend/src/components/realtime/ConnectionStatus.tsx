"use client";

import { useRealtime } from './RealtimeProvider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const ConnectionStatus = () => {
  const { isConnected, isConnecting } = useRealtime();

  if (isConnecting) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting...
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500">
        <Wifi className="h-3 w-3" />
        Live
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      Offline
    </Badge>
  );
};