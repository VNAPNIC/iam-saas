"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useHasPermission } from '@/hooks/useHasPermission';

interface Alert {
    id: string;
    severity: string;
    message: string;
    tenant: string;
    tenantId?: string;
    createdAt: string;
    status: string;
    event: string;
    description?: string;
}

const mockAlerts: Alert[] = [
    { 
        id: '1', 
        severity: 'HIGH', 
        message: 'Gói Premium sắp hết hạn', 
        tenant: 'Acme Corp', 
        tenantId: '1',
        createdAt: '2025-07-17T14:30:00Z', 
        status: 'NEW',
        event: 'subscription_expiring',
        description: 'Gói Premium của tenant Acme Corp sẽ hết hạn trong 3 ngày tới. Cần thông báo cho khách hàng để gia hạn.'
    },
    { 
        id: '2', 
        severity: 'WARNING', 
        message: 'Nhiều lần đăng nhập thất bại', 
        tenant: 'Beta Inc', 
        tenantId: '2',
        createdAt: '2025-07-17T11:00:00Z', 
        status: 'ACKNOWLEDGED',
        event: 'multiple_login_failures',
        description: 'Phát hiện 15 lần đăng nhập thất bại liên tiếp từ IP 192.168.1.100 trong vòng 10 phút.'
    },
    { 
        id: '3', 
        severity: 'INFO', 
        message: 'Webhook gửi thất bại', 
        tenant: 'Gamma Ltd', 
        tenantId: '3',
        createdAt: '2025-07-16T20:15:00Z', 
        status: 'RESOLVED',
        event: 'webhook_failure',
        description: 'Webhook endpoint https://gamma.com/webhook không phản hồi. Đã thử lại 3 lần.'
    },
];

const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
        case 'HIGH': 
        case 'CRITICAL': 
            return <Badge variant="destructive">Cao</Badge>;
        case 'WARNING': 
        case 'MEDIUM': 
            return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
        case 'INFO': 
        case 'LOW': 
            return <Badge className="bg-blue-100 text-blue-800">Thấp</Badge>;
        default: return <Badge variant="secondary">{severity}</Badge>;
    }
};

const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
        case 'NEW': 
        case 'UNREAD': 
            return <Badge variant="outline">Chưa đọc</Badge>;
        case 'ACKNOWLEDGED': 
        case 'READ': 
            return <Badge variant="secondary">Đã đọc</Badge>;
        case 'RESOLVED': 
            return <Badge className="bg-green-100 text-green-800">Đã giải quyết</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
};

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const AlertsPage = () => {
    const canUpdate = useHasPermission(['alerts:update', 'super:admin']);
    const canDelete = useHasPermission(['alerts:delete', 'super:admin']);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        severity: '',
        status: '',
        tenant: ''
    });

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            setAlerts(mockAlerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        loadAlerts();
    };

    const handleViewDetails = (alert: Alert) => {
        setSelectedAlert(alert);
        setIsModalOpen(true);
    };

    const handleResolve = async (alertId: string) => {
        try {
            setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    const handleDelete = async (alertId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cảnh báo này?')) {
            try {
                setAlerts(alerts.filter(a => a.id !== alertId));
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error deleting alert:', error);
            }
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Cảnh báo</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Bộ lọc Cảnh báo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
                        <Select value={filters.severity} onValueChange={(value: string) => handleFilterChange('severity', value)}>
                            <SelectTrigger><SelectValue placeholder="Tất cả mức độ" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Tất cả</SelectItem>
                                <SelectItem value="HIGH">Cao</SelectItem>
                                <SelectItem value="WARNING">Trung bình</SelectItem>
                                <SelectItem value="INFO">Thấp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <Select value={filters.status} onValueChange={(value: string) => handleFilterChange('status', value)}>
                            <SelectTrigger><SelectValue placeholder="Tất cả trạng thái" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Tất cả</SelectItem>
                                <SelectItem value="NEW">Chưa đọc</SelectItem>
                                <SelectItem value="ACKNOWLEDGED">Đã đọc</SelectItem>
                                <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                        <Input 
                            placeholder="Tên hoặc ID tenant..." 
                            value={filters.tenant}
                            onChange={(e) => handleFilterChange('tenant', e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={applyFilters} disabled={loading} className="w-full">
                            {loading ? 'Đang tải...' : 'Áp dụng bộ lọc'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tất cả Cảnh báo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mức độ</TableHead>
                                <TableHead>Nội dung</TableHead>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                                    <TableCell className="font-medium">{alert.message}</TableCell>
                                    <TableCell>{alert.tenant}</TableCell>
                                    <TableCell>{formatDateTime(alert.createdAt)}</TableCell>
                                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>
                                            Xem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {alerts.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            Không có cảnh báo nào
                        </div>
                    )}
                    
                    {loading && (
                        <div className="text-center py-8 text-gray-500">
                            Đang tải dữ liệu...
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chi tiết Cảnh báo</DialogTitle>
                    </DialogHeader>
                    {selectedAlert && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Mức độ:</p>
                                    <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Trạng thái:</p>
                                    <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tenant:</p>
                                    <p className="mt-1">{selectedAlert.tenant}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Thời gian:</p>
                                    <p className="mt-1">{formatDateTime(selectedAlert.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Loại sự kiện:</p>
                                    <p className="mt-1 font-mono text-sm">{selectedAlert.event}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tenant ID:</p>
                                    <p className="mt-1">{selectedAlert.tenantId || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nội dung:</p>
                                <p className="mt-1 font-medium">{selectedAlert.message}</p>
                            </div>
                            {selectedAlert.description && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Mô tả chi tiết:</p>
                                    <p className="mt-1 text-sm text-gray-700">{selectedAlert.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        {selectedAlert && selectedAlert.status !== 'RESOLVED' && canUpdate && (
                             <Button variant="secondary" onClick={() => handleResolve(selectedAlert.id)}>
                                Đánh dấu đã giải quyết
                             </Button>
                        )}
                        {canDelete && (
                            <Button variant="destructive" onClick={() => selectedAlert && handleDelete(selectedAlert.id)}>
                                Xóa
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button variant="outline">Đóng</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AlertsPage;
