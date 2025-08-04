'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { tenantService, UpdatePasswordPolicyRequest } from '@/services/tenantService';

const PasswordPolicyPage = ({ params }: { params: Promise<{ tenantId: string }> }) => {
    const [tenantId, setTenantId] = useState<string>('');
    const [minLength, setMinLength] = useState(8);
    const [maxLength, setMaxLength] = useState(128);
    const [requireUppercase, setRequireUppercase] = useState(true);
    const [requireLowercase, setRequireLowercase] = useState(true);
    const [requireNumbers, setRequireNumbers] = useState(true);
    const [requireSpecialChars, setRequireSpecialChars] = useState(true);
    const [specialChars, setSpecialChars] = useState('!@#$%^&*()_+-=[]{}|;:,.<>?');
    const [isLoading, setIsLoading] = useState(false);
    const [tenantDomain, setTenantDomain] = useState('');

    // Extract tenantId from params
    useEffect(() => {
        params.then(({ tenantId: id }) => {
            setTenantId(id);
        });
    }, [params]);

    // Load current password policy if it exists
    useEffect(() => {
        if (!tenantId) return;
        const loadPasswordPolicy = async () => {
            try {
                const response = await tenantService.getTenantDetails(tenantId);
                setTenantDomain(response.data.domain || '');
                
                // In a real implementation, you would parse the password policy from response.data
                // For now, we'll use default values
            } catch (error) {
                console.error('Failed to load tenant details', error);
            }
        };

        loadPasswordPolicy();
    }, [tenantId]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const policy = {
                minLength,
                maxLength,
                requireUppercase,
                requireLowercase,
                requireNumbers,
                requireSpecialChars,
                specialChars
            };

            const request: UpdatePasswordPolicyRequest = {
                policy
            };

            await tenantService.updatePasswordPolicy(tenantId, request);
            
            // Show success message
            alert("Password policy updated successfully");
        } catch (error) {
            console.error('Failed to update password policy', error);
            alert("Failed to update password policy");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Password Policy for Tenant Domain: {tenantDomain}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-4">Password Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="min-length">Minimum Length</Label>
                                <Input 
                                    id="min-length" 
                                    type="number" 
                                    min="1" 
                                    max="128" 
                                    value={minLength} 
                                    onChange={(e) => setMinLength(parseInt(e.target.value) || 0)} 
                                />
                            </div>
                            <div>
                                <Label htmlFor="max-length">Maximum Length</Label>
                                <Input 
                                    id="max-length" 
                                    type="number" 
                                    min="1" 
                                    max="128" 
                                    value={maxLength} 
                                    onChange={(e) => setMaxLength(parseInt(e.target.value) || 0)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Character Requirements</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="require-uppercase" 
                                    checked={requireUppercase} 
                                    onCheckedChange={(checked: boolean) => setRequireUppercase(!!checked)} 
                                />
                                <Label htmlFor="require-uppercase">Require Uppercase Letters (A-Z)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="require-lowercase" 
                                    checked={requireLowercase} 
                                    onCheckedChange={(checked: boolean) => setRequireLowercase(!!checked)} 
                                />
                                <Label htmlFor="require-lowercase">Require Lowercase Letters (a-z)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="require-numbers" 
                                    checked={requireNumbers} 
                                    onCheckedChange={(checked: boolean) => setRequireNumbers(!!checked)} 
                                />
                                <Label htmlFor="require-numbers">Require Numbers (0-9)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="require-special" 
                                    checked={requireSpecialChars} 
                                    onCheckedChange={(checked: boolean) => setRequireSpecialChars(!!checked)} 
                                />
                                <Label htmlFor="require-special">Require Special Characters</Label>
                            </div>
                        </div>
                    </div>

                    {requireSpecialChars && (
                        <div>
                            <Label htmlFor="special-chars">Allowed Special Characters</Label>
                            <Input 
                                id="special-chars" 
                                value={specialChars} 
                                onChange={(e) => setSpecialChars(e.target.value)} 
                                placeholder="Enter special characters"
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Password Policy"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PasswordPolicyPage;