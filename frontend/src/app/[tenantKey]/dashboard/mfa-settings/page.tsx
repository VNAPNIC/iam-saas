"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const mockHistory = [
    { action: 'Bật MFA', actor: 'john.doe@acme.com', time: '2025-07-16 18:30:00', details: 'Bật các phương thức: Authenticator, Email' },
    { action: 'Reset MFA', actor: 'admin@acme.com', time: '2025-07-15 09:10:00', details: 'Reset MFA cho người dùng: jane.cooper@acme.com' },
];

const MfaSettingsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Add state for MFA settings here

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">MFA Settings</h1>
                <Button variant="outline">Export History</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current MFA Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><p className="font-medium">MFA Status:</p><p className="text-green-600">Enabled</p></div>
                        <div><p className="font-medium">Allowed Methods:</p><p>Authenticator App, Email</p></div>
                        <div><p className="font-medium">OTP Expiry:</p><p>60 seconds</p></div>
                        <div><p className="font-medium">Policy:</p><p>Required for all admins</p></div>
                    </div>
                    <div className="mt-6 flex space-x-2">
                        <Button onClick={() => setIsModalOpen(true)}>Edit Configuration</Button>
                        <Button variant="destructive">Reset MFA for All Users</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>MFA Change History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockHistory.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.actor}</TableCell>
                                    <TableCell>{log.time}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit MFA Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mfa-policy" className="text-right">Policy</Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a policy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                    <SelectItem value="optional">Optional for users</SelectItem>
                                    <SelectItem value="required_all">Required for all</SelectItem>
                                    <SelectItem value="required_admins">Required for admins</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Allowed Methods</Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex items-center space-x-2"><Checkbox id="auth-app" /><Label htmlFor="auth-app">Authenticator App</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="email" /><Label htmlFor="email">Email</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="sms" /><Label htmlFor="sms">SMS</Label></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="otp-expiry" className="text-right">OTP Expiry (s)</Label>
                            <Input id="otp-expiry" type="number" defaultValue="60" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MfaSettingsPage;
