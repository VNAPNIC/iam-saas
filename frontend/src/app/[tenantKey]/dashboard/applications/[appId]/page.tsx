"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EyeOpenIcon, EyeClosedIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

// Mock data - replace with API call
const getApplicationDetails = (appId: string) => ({
    id: appId,
    name: 'Hệ thống CRM nội bộ',
    clientId: 'asdf123-qwer456-zxcv789',
    clientSecret: 'super_secret_key_that_is_long_and_random',
    redirectUris: 'https://crm.mycompany.com/callback\nhttps://staging.crm.mycompany.com/callback',
});

const ApplicationDetailsPage = ({ params }: { params: { tenantKey: string, appId: string } }) => {
    const [app, setApp] = useState(() => getApplicationDetails(params.appId));
    const [isSecretVisible, setIsSecretVisible] = useState(false);

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        // Add API call to save changes here
        console.log('Saving changes:', app);
        alert('Changes saved successfully!');
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            // Add API call to delete application here
            console.log('Deleting application:', app.id);
            alert('Application deleted.');
            // Redirect to applications list
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="mb-6">
                <Link href={`/${params.tenantKey}/dashboard/applications`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <ArrowLeftIcon className="mr-2" />
                    Back to Applications
                </Link>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                        <div>
                            <Label htmlFor="app-name">Application Name</Label>
                            <Input id="app-name" value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="client-id">Client ID</Label>
                            <Input id="client-id" readOnly value={app.clientId} className="bg-gray-100 font-mono" />
                        </div>
                        <div>
                            <Label htmlFor="client-secret">Client Secret</Label>
                            <div className="relative">
                                <Input id="client-secret" type={isSecretVisible ? 'text' : 'password'} readOnly value={app.clientSecret} className="bg-gray-100 font-mono pr-10" />
                                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0" onClick={() => setIsSecretVisible(!isSecretVisible)}>
                                    {isSecretVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="redirect-uris">Redirect URIs</Label>
                            <Textarea id="redirect-uris" value={app.redirectUris} onChange={(e) => setApp({ ...app, redirectUris: e.target.value })} rows={3} className="font-mono" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-red-500">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Delete this application</p>
                            <p className="text-sm text-gray-500">This action is permanent and cannot be undone.</p>
                        </div>
                        <Button variant="destructive" onClick={handleDelete}>Delete Application</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApplicationDetailsPage;
