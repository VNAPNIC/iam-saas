"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const mockAlerts = [
    { id: '1', severity: 'High', content: 'Gói Premium sắp hết hạn', tenant: 'Acme Corp', time: '17/07/2025 14:30', status: 'Unread' },
    { id: '2', severity: 'Medium', content: 'Nhiều lần đăng nhập thất bại', tenant: 'Beta Inc', time: '17/07/2025 11:00', status: 'Read' },
    { id: '3', severity: 'Low', content: 'Webhook gửi thất bại', tenant: 'Gamma Ltd', time: '16/07/2025 20:15', status: 'Resolved' },
];

const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'high': return <Badge variant="destructive">High</Badge>;
        case 'medium': return <Badge variant="secondary">Medium</Badge>;
        case 'low': return <Badge variant="default">Low</Badge>;
        default: return <Badge>{severity}</Badge>;
    }
};

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'unread': return <Badge variant="outline">Unread</Badge>;
        case 'read': return <Badge variant="secondary">Read</Badge>;
        case 'resolved': return <Badge className="bg-green-500 text-white">Resolved</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

const AlertsPage = () => {
    const [alerts, setAlerts] = useState(mockAlerts);
    const [selectedAlert, setSelectedAlert] = useState<typeof mockAlerts[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (alert: typeof mockAlerts[0]) => {
        setSelectedAlert(alert);
        setIsModalOpen(true);
    };

    const handleResolve = (alertId: string) => {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a));
        setIsModalOpen(false);
    };

    const handleDelete = (alertId: string) => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
            setAlerts(alerts.filter(a => a.id !== alertId));
            setIsModalOpen(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filter Alerts</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Tenant Name or ID..." />
                    <Button>Apply Filters</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Severity</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                                    <TableCell>{alert.content}</TableCell>
                                    <TableCell>{alert.tenant}</TableCell>
                                    <TableCell>{alert.time}</TableCell>
                                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alert Details</DialogTitle>
                    </DialogHeader>
                    {selectedAlert && (
                        <div className="space-y-4 py-4">
                            <p><strong>Severity:</strong> {getSeverityBadge(selectedAlert.severity)}</p>
                            <p><strong>Content:</strong> {selectedAlert.content}</p>
                            <p><strong>Tenant:</strong> {selectedAlert.tenant}</p>
                            <p><strong>Time:</strong> {selectedAlert.time}</p>
                            <p><strong>Status:</strong> {getStatusBadge(selectedAlert.status)}</p>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedAlert && selectedAlert.status !== 'Resolved' && (
                             <Button variant="secondary" onClick={() => handleResolve(selectedAlert.id)}>Mark as Resolved</Button>
                        )}
                        <Button variant="destructive" onClick={() => selectedAlert && handleDelete(selectedAlert.id)}>Delete</Button>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AlertsPage;
