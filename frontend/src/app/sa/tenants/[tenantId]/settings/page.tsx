'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesktopIcon, LaptopIcon, MobileIcon } from "@radix-ui/react-icons";

const TenantSettingsPage = ({ params }: { params: { tenantId: string } }) => {
    const [tenantName, setTenantName] = useState('IAM SaaS');
    const [primaryColor, setPrimaryColor] = useState('#4338ca');
    const [allowPublicSignup, setAllowPublicSignup] = useState(true);
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const [loginLogo, setLoginLogo] = useState<string | null>(null);
    const [signupLogo, setSignupLogo] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'login' | 'signup') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'login') {
                    setLoginLogo(reader.result as string);
                } else {
                    setSignupLogo(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getIframeContent = (type: 'login' | 'signup') => {
        const logoToShow = type === 'signup' && signupLogo ? signupLogo : loginLogo;
        const logoHtml = logoToShow ? `<img src="${logoToShow}" alt="Logo" style="height: 48px; width: auto;" />` : '<i class="fas fa-lock fa-lg"></i>';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${type === 'login' ? 'Login' : 'Signup'} Preview</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                    .card { background-color: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); max-width: 400px; width: 100%; }
                    .logo-container { display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem; }
                    .logo { width: 48px; height: 48px; background-color: ${primaryColor}; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; }
                    h1 { font-size: 1.25rem; font-weight: 600; }
                    p { color: #6b7280; }
                    button { background-color: ${primaryColor}; color: white; width: 100%; padding: 0.75rem; border-radius: 0.375rem; border: none; cursor: pointer; }
                    a { color: ${primaryColor}; text-decoration: none; }
                    .signup-link { display: ${allowPublicSignup ? 'block' : 'none'}; text-align: center; margin-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="logo-container">
                        <div class="logo">${logoHtml}</div>
                        <div style="margin-left: 1rem;">
                            <h1>${tenantName}</h1>
                            <p>${type === 'login' ? 'Welcome back!' : 'Create your account'}</p>
                        </div>
                    </div>
                    <form>
                        <input type="email" placeholder="email@example.com" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 1rem;" />
                        <input type="password" placeholder="Password" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 1rem;" />
                        <button type="submit">${type === 'login' ? 'Login' : 'Sign Up'}</button>
                    </form>
                    <div class="signup-link">
                        <a href="#">${type === 'login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Login'}</a>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const getPreviewSize = () => {
        switch (previewDevice) {
            case 'tablet': return { width: '768px', height: '1024px' };
            case 'mobile': return { width: '375px', height: '667px' };
            default: return { width: '100%', height: '100%' };
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full p-4">
            <Card className="overflow-y-auto">
                <CardHeader>
                    <CardTitle>Tenant Settings for ID: {params.tenantId}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="text-lg font-medium">General</h3>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label htmlFor="tenant-name-input">Tenant Name</Label>
                                <Input id="tenant-name-input" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Branding</h3>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label htmlFor="logo-upload-login">Login Page Logo</Label>
                                <Input id="logo-upload-login" type="file" onChange={(e) => handleLogoChange(e, 'login')} />
                            </div>
                            <div>
                                <Label htmlFor="logo-upload-signup">Signup Page Logo (Optional)</Label>
                                <Input id="logo-upload-signup" type="file" onChange={(e) => handleLogoChange(e, 'signup')} />
                            </div>
                            <div>
                                <Label htmlFor="primary-color-input">Primary Color</Label>
                                <Input id="primary-color-input" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Access</h3>
                        <div className="flex items-center justify-between mt-4">
                            <Label htmlFor="public-signup-toggle">Allow Public Signup</Label>
                            <Switch id="public-signup-toggle" checked={allowPublicSignup} onCheckedChange={setAllowPublicSignup} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button>Save All Settings</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col">
                <Tabs defaultValue="login" className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <TabsList>
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Signup</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center space-x-1 p-1 bg-slate-200 rounded-lg">
                            <Button variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewDevice('desktop')}><DesktopIcon /></Button>
                            <Button variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewDevice('tablet')}><LaptopIcon /></Button>
                            <Button variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewDevice('mobile')}><MobileIcon /></Button>
                        </div>
                    </div>
                    <TabsContent value="login">
                        <div className="bg-white shadow-lg rounded-lg flex flex-col" style={{ height: '70vh' }}>
                             <div className="bg-gray-200 p-2 flex items-center rounded-t-lg">
                                <div className="flex space-x-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="w-3 h-3 bg-yellow-500 rounded-full"></div><div className="w-3 h-3 bg-green-500 rounded-full"></div></div>
                            </div>
                            <iframe
                                srcDoc={getIframeContent('login')}
                                className="w-full h-full border-0 transition-all"
                                style={getPreviewSize()}
                                title="Signup Preview"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="signup">
                         <div className="bg-white shadow-lg rounded-lg flex flex-col" style={{ height: '70vh' }}>
                             <div className="bg-gray-200 p-2 flex items-center rounded-t-lg">
                                <div className="flex space-x-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="w-3 h-3 bg-yellow-500 rounded-full"></div><div className="w-3 h-3 bg-green-500 rounded-full"></div></div>
                            </div>
                            <iframe
                                srcDoc={getIframeContent('signup')}
                                className="w-full h-full border-0 transition-all"
                                style={getPreviewSize()}
                                title="Signup Preview"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default TenantSettingsPage;
