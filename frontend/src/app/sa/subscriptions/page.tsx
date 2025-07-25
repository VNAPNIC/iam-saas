"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Subscription {
  id: string;
  tenantName: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
}

const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: 'tenantName',
    header: 'Tenant',
  },
  {
    accessorKey: 'planName',
    header: 'Plan',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'currentPeriodEnd',
    header: 'Current Period End',
  },
];

const data: Subscription[] = [
  {
    id: '1',
    tenantName: 'Acme Corp',
    planName: 'Enterprise',
    status: 'active',
    currentPeriodEnd: '2025-12-31',
  },
  {
    id: '2',
    tenantName: 'Globex Inc',
    planName: 'Startup',
    status: 'past_due',
    currentPeriodEnd: '2025-07-15',
  },
];

const SubscriptionsPage = () => {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsPage;