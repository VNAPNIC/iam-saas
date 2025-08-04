"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient } from '@/lib/apiClient';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Simple chart replacements
const ResponsiveContainer = ({ children, width, height }: any) => (
  <div style={{ width, height }}>{children}</div>
);
const BarChart = ({ data, children }: any) => (
  <div className="bg-gray-100 p-4 rounded">Chart: {data?.length || 0} data points</div>
);
const LineChart = ({ data, children }: any) => (
  <div className="bg-gray-100 p-4 rounded">Line Chart: {data?.length || 0} data points</div>
);
const Bar = ({ dataKey }: any) => null;
const Line = ({ dataKey }: any) => null;
const XAxis = ({ dataKey }: any) => null;
const YAxis = () => null;
const CartesianGrid = ({ strokeDasharray }: any) => null;
const Tooltip = () => null;
import { Activity, AlertTriangle, Settings, TrendingUp, Clock, Shield } from 'lucide-react';

interface RateLimitConfig {
  id: string;
  endpoint: string;
  method: string;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  burstWindow: number;
  enabled: boolean;
}

interface RateLimitStatus {
  endpoint: string;
  method: string;
  currentHour: number;
  currentDay: number;
  currentBurst: number;
  limitHour: number;
  limitDay: number;
  limitBurst: number;
  resetTime: string;
  blocked: boolean;
  blockedUntil?: string;
}

interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    blocked: number;
  }>;
  hourlyData: Array<{
    hour: string;
    requests: number;
    blocked: number;
  }>;
}

export const RateLimitDashboard = () => {
  const [configs, setConfigs] = useState<RateLimitConfig[]>([]);
  const [statuses, setStatuses] = useState<RateLimitStatus[]>([]);
  const [metrics, setMetrics] = useState<RateLimitMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<RateLimitConfig | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [configResponse, statusResponse, metricsResponse] = await Promise.all([
        apiClient.get('/rate-limits/configs'),
        apiClient.get('/rate-limits/status'),
        apiClient.get('/rate-limits/metrics'),
      ]);

      setConfigs(configResponse.data.data || []);
      setStatuses(statusResponse.data.data || []);
      setMetrics(metricsResponse.data.data);

    } catch (error) {
      console.error('Failed to load rate limit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeUntilReset = (resetTime: string) => {
    const reset = new Date(resetTime);
    const now = new Date();
    const diff = reset.getTime() - now.getTime();
    
    if (diff <= 0) return 'Reset now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const renderOverviewCards = () => {
    if (!metrics) return null;

    const blockedPercentage = metrics.totalRequests > 0 
      ? (metrics.blockedRequests / metrics.totalRequests) * 100 
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.blockedRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {blockedPercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Limits</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.filter(c => c.enabled).length}</div>
            <p className="text-xs text-muted-foreground">
              {configs.length} total configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...statuses.map(s => getUsagePercentage(s.currentHour, s.limitHour))).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Highest endpoint usage</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle>Current Rate Limit Status</CardTitle>
        <CardDescription>Real-time usage for all configured endpoints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((status, index) => {
            const hourlyUsage = getUsagePercentage(status.currentHour, status.limitHour);
            const dailyUsage = getUsagePercentage(status.currentDay, status.limitDay);
            const burstUsage = getUsagePercentage(status.currentBurst, status.limitBurst);

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Badge variant="outline" className="mr-2">{status.method}</Badge>
                    <span className="font-medium">{status.endpoint}</span>
                  </div>
                  {status.blocked && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Blocked
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hourly</span>
                      <span className={getUsageColor(hourlyUsage)}>
                        {status.currentHour}/{status.limitHour}
                      </span>
                    </div>
                    <Progress value={hourlyUsage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily</span>
                      <span className={getUsageColor(dailyUsage)}>
                        {status.currentDay}/{status.limitDay}
                      </span>
                    </div>
                    <Progress value={dailyUsage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Burst</span>
                      <span className={getUsageColor(burstUsage)}>
                        {status.currentBurst}/{status.limitBurst}
                      </span>
                    </div>
                    <Progress value={burstUsage} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    <Clock className="w-3 h-3 inline mr-1" />
                    Resets in {formatTimeUntilReset(status.resetTime)}
                  </span>
                  {status.blocked && status.blockedUntil && (
                    <span className="text-red-600">
                      Blocked until {new Date(status.blockedUntil).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderMetricsCharts = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Request Volume</CardTitle>
            <CardDescription>Requests and blocks over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" />
                <Line type="monotone" dataKey="blocked" stroke="#ff7300" name="Blocked" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most active endpoints by request volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.topEndpoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#8884d8" name="Requests" />
                <Bar dataKey="blocked" fill="#ff7300" name="Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConfigurationTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limit Configurations</CardTitle>
        <CardDescription>Manage rate limits for different endpoints</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Hourly Limit</TableHead>
              <TableHead>Daily Limit</TableHead>
              <TableHead>Burst Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">{config.endpoint}</TableCell>
                <TableCell>
                  <Badge variant="outline">{config.method}</Badge>
                </TableCell>
                <TableCell>{config.requestsPerHour.toLocaleString()}</TableCell>
                <TableCell>{config.requestsPerDay.toLocaleString()}</TableCell>
                <TableCell>{config.burstLimit}</TableCell>
                <TableCell>
                  <Badge variant={config.enabled ? "default" : "secondary"}>
                    {config.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedConfig(config);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading rate limit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Limiting</h1>
          <p className="text-gray-600">Monitor and configure API rate limits</p>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          Add Rate Limit
        </Button>
      </div>

      {renderOverviewCards()}

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Current Status</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {renderCurrentStatus()}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {renderMetricsCharts()}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          {renderConfigurationTable()}
        </TabsContent>
      </Tabs>

      {/* Rate Limit Configuration Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig ? 'Edit Rate Limit' : 'Add Rate Limit'}
            </DialogTitle>
            <DialogDescription>
              Configure rate limiting for API endpoints
            </DialogDescription>
          </DialogHeader>
          {/* Configuration form would go here */}
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Rate limit configuration form will be implemented in the next iteration.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
