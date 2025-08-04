'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { tenantService, UpdateDomainRequest, VerifyDomainRequest } from '@/services/tenantService';

const DomainSettingsPage = ({ params }: { params: Promise<{ tenantId: string }> }) => {
    const [tenantId, setTenantId] = useState<string>('');
    const [domain, setDomain] = useState('');
    const [verificationMethod, setVerificationMethod] = useState('dns');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [tenantDomain, setTenantDomain] = useState('');
    const [isDomainVerified, setIsDomainVerified] = useState(false);

    // Extract tenantId from params
    useEffect(() => {
        params.then(({ tenantId: id }) => {
            setTenantId(id);
        });
    }, [params]);

    // Load current domain settings if they exist
    useEffect(() => {
        if (!tenantId) return;
        
        const loadDomainSettings = async () => {
            try {
                const response = await tenantService.getTenantDetails(tenantId);
                setTenantDomain(response.data.domain || '');
                setIsDomainVerified(response.data.domainVerified || false);
                setDomain(response.data.domain || '');
            } catch (error) {
                console.error('Failed to load tenant details', error);
            }
        };

        loadDomainSettings();
    }, [tenantId]);

    const handleSaveDomain = async () => {
        setIsLoading(true);
        try {
            const request: UpdateDomainRequest = {
                domain
            };

            await tenantService.updateDomain(tenantId, request);
            
            // Show success message
            alert("Domain updated successfully. Please verify ownership to activate it.");
            
            // Update local state
            setTenantDomain(domain);
            setIsDomainVerified(false);
        } catch (error) {
            console.error('Failed to update domain', error);
            alert("Failed to update domain");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDomain = async () => {
        if (!tenantDomain) {
            alert("Please set a domain first");
            return;
        }

        setIsVerifying(true);
        try {
            const request: VerifyDomainRequest = {
                method: verificationMethod
            };

            const response = await tenantService.verifyDomain(tenantId, request);
            
            if ((response.data as any).verified) {
                setIsDomainVerified(true);
                alert("Domain verified successfully!");
            } else {
                alert("Domain verification failed. Please check your DNS records or file and try again.");
            }
        } catch (error) {
            console.error('Failed to verify domain', error);
            alert("Failed to verify domain");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Domain Settings for Tenant ID: {tenantId}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="domain-input">Custom Domain</Label>
                        <Input 
                            id="domain-input" 
                            value={domain} 
                            onChange={(e) => setDomain(e.target.value)} 
                            placeholder="yourcompany.com"
                        />
                        {tenantDomain && (
                            <p className="text-sm text-gray-500 mt-1">
                                Current domain: {tenantDomain} 
                                {isDomainVerified ? (
                                    <span className="text-green-600 ml-2">✓ Verified</span>
                                ) : (
                                    <span className="text-yellow-600 ml-2">⚠ Not verified</span>
                                )}
                            </p>
                        )}
                    </div>

                    <Button 
                        onClick={handleSaveDomain} 
                        disabled={isLoading || !domain}
                        className="w-full"
                    >
                        {isLoading ? 'Saving...' : 'Save Domain'}
                    </Button>
                </CardContent>
            </Card>

            {tenantDomain && !isDomainVerified && (
                <Card>
                    <CardHeader>
                        <CardTitle>Domain Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label>Verification Method</Label>
                            <select 
                                value={verificationMethod} 
                                onChange={(e) => setVerificationMethod(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            >
                                <option value="dns">DNS Record</option>
                                <option value="file">File Upload</option>
                            </select>
                        </div>

                        {verificationMethod === 'dns' && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium mb-2">DNS Verification Instructions</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    Add the following TXT record to your domain&apos;s DNS settings:
                                </p>
                                <div className="bg-white p-2 border rounded font-mono text-sm">
                                    <strong>Name:</strong> _iam-verification<br/>
                                    <strong>Value:</strong> iam-verify-{tenantId}-{Date.now()}
                                </div>
                            </div>
                        )}

                        {verificationMethod === 'file' && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium mb-2">File Verification Instructions</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    Upload a file with the following content to your domain&apos;s root directory:
                                </p>
                                <div className="bg-white p-2 border rounded font-mono text-sm">
                                    <strong>File:</strong> iam-verification.txt<br/>
                                    <strong>Content:</strong> iam-verify-{tenantId}-{Date.now()}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    The file should be accessible at: https://{tenantDomain}/iam-verification.txt
                                </p>
                            </div>
                        )}

                        <Button 
                            onClick={handleVerifyDomain} 
                            disabled={isVerifying}
                            className="w-full"
                        >
                            {isVerifying ? 'Verifying...' : 'Verify Domain'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DomainSettingsPage;