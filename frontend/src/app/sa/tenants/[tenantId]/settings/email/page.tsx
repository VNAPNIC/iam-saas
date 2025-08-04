'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tenantService, UpdateEmailSettingsRequest } from '@/services/tenantService';

const EmailSettingsPage = ({ params }: { params: Promise<{ tenantId: string }> }) => {
    const [tenantId, setTenantId] = useState<string>('');
    const [provider, setProvider] = useState('console');
    const [sesConfig, setSesConfig] = useState({
        region: '',
        accessKeyId: '',
        secretAccessKey: '',
        senderEmail: ''
    });
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: '',
        username: '',
        password: '',
        senderEmail: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [tenantDomain, setTenantDomain] = useState('');

    // Load current email settings if they exist
    useEffect(() => {
        const loadEmailSettings = async () => {
            try {
                const response = await tenantService.getTenantDetails(tenantId);
                setTenantDomain(response.data.domain || '');
                // Placeholder for loading existing settings
                // In a real implementation, you would parse the email settings from response.data
            } catch (error) {
                console.error('Failed to load tenant details', error);
            }
        };

        loadEmailSettings();
    }, [tenantId]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            let config: Record<string, any> = {};
            
            switch (provider) {
                case 'ses':
                    config = { ...sesConfig };
                    break;
                case 'smtp':
                    config = { ...smtpConfig };
                    break;
                case 'console':
                    // No additional config needed for console provider
                    break;
                default:
                    throw new Error(`Unsupported email provider: ${provider}`);
            }

            const request: UpdateEmailSettingsRequest = {
                provider,
                config
            };

            await tenantService.updateEmailSettings(tenantId, request);
            
            alert("Email settings updated successfully");
        } catch (error) {
            console.error('Failed to update email settings', error);
            alert("Failed to update email settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Email Settings for Tenant Domain: {tenantDomain}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="provider-select">Email Provider</Label>
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger id="provider-select">
                                <SelectValue placeholder="Select email provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="console">Console (Development)</SelectItem>
                                <SelectItem value="ses">Amazon SES</SelectItem>
                                <SelectItem value="smtp">SMTP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {provider === 'ses' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Amazon SES Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="ses-region">Region</Label>
                                    <Input 
                                        id="ses-region" 
                                        value={sesConfig.region} 
                                        onChange={(e) => setSesConfig({...sesConfig, region: e.target.value})} 
                                        placeholder="us-east-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ses-access-key-id">Access Key ID</Label>
                                    <Input 
                                        id="ses-access-key-id" 
                                        value={sesConfig.accessKeyId} 
                                        onChange={(e) => setSesConfig({...sesConfig, accessKeyId: e.target.value})} 
                                        placeholder="Your AWS Access Key ID"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ses-secret-access-key">Secret Access Key</Label>
                                    <Input 
                                        id="ses-secret-access-key" 
                                        type="password"
                                        value={sesConfig.secretAccessKey} 
                                        onChange={(e) => setSesConfig({...sesConfig, secretAccessKey: e.target.value})} 
                                        placeholder="Your AWS Secret Access Key"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ses-sender-email">Sender Email</Label>
                                    <Input 
                                        id="ses-sender-email" 
                                        value={sesConfig.senderEmail} 
                                        onChange={(e) => setSesConfig({...sesConfig, senderEmail: e.target.value})} 
                                        placeholder="noreply@yourdomain.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {provider === 'smtp' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">SMTP Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="smtp-host">Host</Label>
                                    <Input 
                                        id="smtp-host" 
                                        value={smtpConfig.host} 
                                        onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})} 
                                        placeholder="smtp.yourdomain.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="smtp-port">Port</Label>
                                    <Input 
                                        id="smtp-port" 
                                        value={smtpConfig.port} 
                                        onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})} 
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="smtp-username">Username</Label>
                                    <Input 
                                        id="smtp-username" 
                                        value={smtpConfig.username} 
                                        onChange={(e) => setSmtpConfig({...smtpConfig, username: e.target.value})} 
                                        placeholder="your-smtp-username"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="smtp-password">Password</Label>
                                    <Input 
                                        id="smtp-password" 
                                        type="password"
                                        value={smtpConfig.password} 
                                        onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})} 
                                        placeholder="your-smtp-password"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="smtp-sender-email">Sender Email</Label>
                                    <Input 
                                        id="smtp-sender-email" 
                                        value={smtpConfig.senderEmail} 
                                        onChange={(e) => setSmtpConfig({...smtpConfig, senderEmail: e.target.value})} 
                                        placeholder="noreply@yourdomain.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Email Settings"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmailSettingsPage;