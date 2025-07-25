"use client";

import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

const LandingPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            const currentCanvas = canvasRef.current;
            if (!currentCanvas) return;
            const currentCtx = currentCanvas.getContext('2d');
            if (!currentCtx) return;

            currentCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            currentCtx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
            currentCtx.fillStyle = '#f86823';
            currentCtx.font = `${fontSize}px monospace`;
            drops.forEach((y, i) => {
                const text = letters[Math.floor(Math.random() * letters.length)];
                currentCtx.fillText(text, i * fontSize, y * fontSize);
                if (y * fontSize > currentCanvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        }

        const interval = setInterval(drawMatrix, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head>
                <title>IAM SaaS - Secure Identity and Access Management</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>
            <body className="font-sans bg-gray-50 text-[#656565]">
                <header className="bg-[#333338] text-white sticky top-0 z-50 shadow-lg">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="mr-4">
                                    {/* <Image src="/logo.png" alt="IAM SaaS Logo" width={40} height={40} /> */}
                                </div>
                                <h1 className="text-2xl font-bold">IAM<span className="text-[#f86823]">SaaS</span></h1>
                            </div>
                            <nav className="hidden md:flex space-x-8">
                                <Link href="#features" className="hover:text-[#f86823] transition">Features</Link>
                                <Link href="#solutions" className="hover:text-[#f86823] transition">Solutions</Link>
                                <Link href="#pricing" className="hover:text-[#f86823] transition">Pricing</Link>
                                <Link href="#demo" className="hover:text-[#f86823] transition">Demo</Link>
                            </nav>
                            <div className="flex items-center space-x-4">
                                <Link href="/default/login" className="px-4 py-2 rounded-md hover:text-[#f86823] transition">Login</Link>
                                <Link href="/default/signup" className="btn-gradient text-white px-6 py-2 rounded-md">Get Started</Link>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="bg-[#333338] text-white py-20 relative overflow-hidden">
                    <canvas ref={canvasRef} id="matrix-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.1 }}></canvas>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 mb-10 md:mb-0">
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Empower Your Business with Advanced Identity Management</h1>
                                <p className="text-xl text-[#d6d8e2] mb-8">Secure, scalable IAM with SSO, MFA, and granular access controls.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/default/signup" className="btn-gradient text-white px-8 py-4 rounded-md text-center font-semibold text-lg">Start Free Trial</Link>
                                    <Link href="#demo" className="border border-white text-white px-8 py-4 rounded-md text-center font-medium hover:bg-white hover:text-[#333338] transition duration-300">Request Demo</Link>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition duration-300">
                                    {/* <Image src="/images/hero-dashboard.png" alt="IAM Dashboard" width={800} height={600} className="w-full" /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 bg-[#fff7f4]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-[#f86823] font-bold uppercase tracking-wider">Features</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#333338] mt-2 mb-4">Powerful Tools for Identity Management</h2>
                            <p className="max-w-2xl mx-auto text-lg text-[#656565]">Everything you need to secure and manage access across your organization.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="feature-card bg-white rounded-xl p-8 shadow-md transition duration-300">
                                <div className="text-[#f86823] mb-4"><i className="fas fa-user-shield text-4xl"></i></div>
                                <h3 className="text-xl font-bold text-[#333338] mb-3">Multi-Tenant Isolation</h3>
                                <p className="text-[#656565]">Securely isolate tenant data with dedicated instances and RBAC.</p>
                            </div>
                            <div className="feature-card bg-white rounded-xl p-8 shadow-md transition duration-300">
                                <div className="text-[#f86823] mb-4"><i className="fas fa-fingerprint text-4xl"></i></div>
                                <h3 className="text-xl font-bold text-[#333338] mb-3">SSO & MFA</h3>
                                <p className="text-[#656565]">Enable single sign-on and multi-factor authentication with ease.</p>
                            </div>
                            <div className="feature-card bg-white rounded-xl p-8 shadow-md transition duration-300">
                                <div className="text-[#f86823] mb-4"><i className="fas fa-users-cog text-4xl"></i></div>
                                <h3 className="text-xl font-bold text-[#333338] mb-3">Granular Access Control</h3>
                                <p className="text-[#656565]">Fine-tune permissions with RBAC and ABAC policies.</p>
                            </div>
                            <div className="feature-card bg-white rounded-xl p-8 shadow-md transition duration-300">
                                <div className="text-[#f86823] mb-4"><i className="fas fa-bell text-4xl"></i></div>
                                <h3 className="text-xl font-bold text-[#333338] mb-3">Real-Time Audit Logs</h3>
                                <p className="text-[#656565]">Track every action with detailed logs and SIEM integration.</p>
                            </div>
                            <div className="feature-card bg-white rounded-xl p-8 shadow-md transition duration-300">
                                <div className="text-[#f86823] mb-4"><i className="fas fa-random text-4xl"></i></div>
                                <h3 className="text-xl font-bold text-[#333338] mb-3">Seamless Integrations</h3>
                                <p className="text-[#656565]">Connect with HRIS, ERP, and CRM via SCIM or webhooks.</p>
                            </div>
                            <div className="feature-card bg-white rounded-xl p-8 shadow-md transition duration-300">
                                <div className="text-[#f86823] mb-4"><i className="fas fa-chart-line text-4xl"></i></div>
                                <h3 className="text-xl font-bold text-[#333338] mb-3">Usage Analytics</h3>
                                <p className="text-[#656565]">Gain insights with customizable dashboards and reports.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="solutions" className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-[#f86823] font-bold uppercase tracking-wider">Solutions</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#333338] mt-2 mb-4">Tailored IAM for Every Industry</h2>
                            <p className="max-w-2xl mx-auto text-lg text-[#656565]">Solutions designed to meet your specific compliance and workflow needs.</p>
                        </div>
                        <div className="mb-12">
                            <div className="flex flex-wrap justify-center border-b border-gray-200">
                                <button className="tab-btn px-6 py-3 font-medium border-b-2 border-transparent hover:text-[#f86823] transition active:border-[#f86823]" data-tab="tab1">Healthcare</button>
                                <button className="tab-btn px-6 py-3 font-medium border-b-2 border-transparent hover:text-[#f86823] transition" data-tab="tab2">Finance</button>
                                <button className="tab-btn px-6 py-3 font-medium border-b-2 border-transparent hover:text-[#f86823] transition" data-tab="tab3">Enterprise</button>
                                <button className="tab-btn px-6 py-3 font-medium border-b-2 border-transparent hover:text-[#f86823] transition" data-tab="tab4">Government</button>
                                <button className="tab-btn px-6 py-3 font-medium border-b-2 border-transparent hover:text-[#f86823] transition" data-tab="tab5">Startups</button>
                            </div>
                        </div>
                        <div className="tab-content-container">
                            <div className="tab-content active fade-in" id="tab1">
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    <div className="md:w-1/2">
                                        <h3 className="text-2xl font-bold text-[#333338] mb-4">HIPAA-Compliant IAM for Healthcare</h3>
                                        <p className="text-[#656565] mb-6">Secure patient data with compliance-ready IAM tools.</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Break-glass emergency access</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Automatic session timeouts</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>EHR integrations (Epic, Cerner)</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>PHI access audit trails</li>
                                        </ul>
                                        <a href="#" className="btn-gradient text-white px-6 py-3 rounded-md inline-block">Learn More</a>
                                    </div>
                                    <div className="md:w-1/2">
                                        {/* <Image src="https://example.com/healthcare-iam.jpg" alt="Healthcare IAM" width={600} height={400} className="rounded-lg shadow-md" /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-content fade-in" id="tab2">
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    <div className="md:w-1/2">
                                        <h3 className="text-2xl font-bold text-[#333338] mb-4">Financial Services Compliance</h3>
                                        <p className="text-[#656565] mb-6">Meet PCI DSS, SOX, and GLBA with robust IAM.</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Privileged access management</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Multi-level approvals</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Banking platform integration</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Automated provisioning</li>
                                        </ul>
                                        <a href="#" className="btn-gradient text-white px-6 py-3 rounded-md inline-block">Learn More</a>
                                    </div>
                                    <div className="md:w-1/2">
                                        {/* <Image src="https://example.com/finance-iam.jpg" alt="Finance IAM" width={600} height={400} className="rounded-lg shadow-md" /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-content fade-in" id="tab3">
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    <div className="md:w-1/2">
                                        <h3 className="text-2xl font-bold text-[#333338] mb-4">Enterprise-Grade IAM</h3>
                                        <p className="text-[#656565] mb-6">Scale securely with enterprise-ready features.</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Unlimited user support</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Multi-region deployment</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Custom integrations</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>24/7 support</li>
                                        </ul>
                                        <a href="#" className="btn-gradient text-white px-6 py-3 rounded-md inline-block">Learn More</a>
                                    </div>
                                    <div className="md:w-1/2">
                                        {/* <Image src="https://example.com/enterprise-iam.jpg" alt="Enterprise IAM" width={600} height={400} className="rounded-lg shadow-md" /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-content fade-in" id="tab4">
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    <div className="md:w-1/2">
                                        <h3 className="text-2xl font-bold text-[#333338] mb-4">Government Security Standards</h3>
                                        <p className="text-[#656565] mb-6">Comply with FedRAMP, FISMA, and more.</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>High-impact security controls</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Data residency options</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Secure audit logging</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Dedicated compliance support</li>
                                        </ul>
                                        <a href="#" className="btn-gradient text-white px-6 py-3 rounded-md inline-block">Learn More</a>
                                    </div>
                                    <div className="md:w-1/2">
                                        {/* <Image src="https://example.com/government-iam.jpg" alt="Government IAM" width={600} height={400} className="rounded-lg shadow-md" /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-content fade-in" id="tab5">
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    <div className="md:w-1/2">
                                        <h3 className="text-2xl font-bold text-[#333338] mb-4">IAM for Startups</h3>
                                        <p className="text-[#656565] mb-6">Affordable security for fast-growing teams.</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Scalable user management</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>SSO for key tools</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Easy onboarding</li>
                                            <li className="flex items-start"><i className="fas fa-check text-[#f86823] mt-1 mr-2"></i>Priority support</li>
                                        </ul>
                                        <a href="#" className="btn-gradient text-white px-6 py-3 rounded-md inline-block">Learn More</a>
                                    </div>
                                    <div className="md:w-1/2">
                                        {/* <Image src="https://example.com/startups-iam.jpg" alt="Startups IAM" width={600} height={400} className="rounded-lg shadow-md" /> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-gradient-orange text-white">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <div className="p-6">
                                <div className="stats-number text-4xl font-bold mb-2" data-target="99.9">0</div>
                                <div className="text-xl">Uptime SLA (%)</div>
                            </div>
                            <div className="p-6">
                                <div className="stats-number text-4xl font-bold mb-2" data-target="10000">0</div>
                                <div className="text-xl">Requests/Sec</div>
                            </div>
                            <div className="p-6">
                                <div className="stats-number text-4xl font-bold mb-2" data-target="1000000">0</div>
                                <div className="text-xl">Concurrent Users</div>
                            </div>
                            <div className="p-6">
                                <div className="stats-number text-4xl font-bold mb-2" data-target="14">0</div>
                                <div className="text-xl">Global Regions</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-20 bg-[#f9f9f9]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-[#f86823] font-bold uppercase tracking-wider">Pricing</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#333338] mt-2 mb-4">Simple, Flexible Plans</h2>
                            <p className="max-w-2xl mx-auto text-lg text-[#656565]">Pick a plan that scales with your business, all with top-tier security.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-8">
                                    <div className="text-[#f86823] font-bold mb-1">Trial</div>
                                    <div className="text-4xl font-bold text-[#333338] mb-4">$0<span className="text-xl text-[#656565]">/mo</span></div>
                                    <p className="text-[#656565] mb-6">Test the platform risk-free.</p>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>14-day free trial</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>100 users</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>50 invoices</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>1,000 API calls</li>
                                    </ul>
                                    <a href="#" className="block w-full bg-gray-200 text-[#333338] text-center py-3 rounded-md hover:bg-gray-300 transition">Start Free Trial</a>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-xl overflow-hidden relative transform scale-105">
                                <div className="absolute top-0 right-0 bg-[#f86823] text-white px-4 py-1 text-xs font-bold rounded-bl-lg">POPULAR</div>
                                <div className="p-8">
                                    <div className="text-[#f86823] font-bold mb-1">Basic</div>
                                    <div className="text-4xl font-bold text-[#333338] mb-4">$50<span className="text-xl text-[#656565]">/mo</span></div>
                                    <p className="text-[#656565] mb-6">Ideal for small businesses.</p>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>1,000 users</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>500 invoices</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>10,000 API calls</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>Single sign-on (SSO)</li>
                                    </ul>
                                    <a href="#" className="btn-gradient block w-full text-white text-center py-3 rounded-md">Get Started</a>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-8">
                                    <div className="text-[#f86823] font-bold mb-1">Pro</div>
                                    <div className="text-4xl font-bold text-[#333338] mb-4">$200<span className="text-xl text-[#656565]">/mo</span></div>
                                    <p className="text-[#656565] mb-6">For growing teams.</p>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>10,000 users</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>5,000 invoices</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>100,000 API calls</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>Advanced SSO</li>
                                    </ul>
                                    <a href="#" className="btn-gradient block w-full text-white text-center py-3 rounded-md">Get Started</a>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-8">
                                    <div className="text-[#f86823] font-bold mb-1">Enterprise</div>
                                    <div className="text-4xl font-bold text-[#333338] mb-4">Custom</div>
                                    <p className="text-[#656565] mb-6">For large-scale needs.</p>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>Unlimited users</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>Unlimited invoices</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>Custom API limits</li>
                                        <li className="flex items-start"><i className="fas fa-check text-green-500 mt-1 mr-2"></i>Multi-region support</li>
                                    </ul>
                                    <a href="#" className="block w-full border border-[#f86823] text-[#f86823] text-center py-3 rounded-md hover:bg-[#f86823] hover:text-white transition">Contact Sales</a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 text-center">
                            <p className="text-[#656565]">All plans include multi-tenant support, GDPR/HIPAA compliance, and enterprise-grade security features.</p>
                        </div>
                    </div>
                </section>

                <section id="demo" className="py-20 bg-[#333338] text-white">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2">
                                <span className="text-[#f86823] font-bold uppercase tracking-wider">Demo</span>
                                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">See IAM SaaS in Action</h2>
                                <p className="text-xl text-[#d6d8e2] mb-8">Explore how our platform secures your business with a live demo or personalized walkthrough.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a href="#" className="btn-gradient text-white px-8 py-4 rounded-md text-center font-semibold">Watch Video</a>
                                    <a href="#" className="border border-white text-white px-8 py-4 rounded-md text-center font-medium hover:bg-white hover:text-[#333338] transition duration-300">Request a Demo</a>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                                    {/* <Image src="https://example.com/demo-video.jpg" alt="Demo Video Thumbnail" width={800} height={600} className="w-full" /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Add other sections here */}

            <footer className="bg-[#333338] text-white py-10">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4">IAM SaaS</h3>
                                <p className="text-[#d6d8e2]">Secure identity and access management for your business.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4">Product</h3>
                                <ul className="space-y-2">
                                    <li><Link href="#features" className="hover:text-[#f86823] transition">Features</Link></li>
                                    <li><Link href="#solutions" className="hover:text-[#f86823] transition">Solutions</Link></li>
                                    <li><Link href="#pricing" className="hover:text-[#f86823] transition">Pricing</Link></li>
                                    <li><Link href="#demo" className="hover:text-[#f86823] transition">Demo</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4">Support</h3>
                                <ul className="space-y-2">
                                    <li><Link href="#" className="hover:text-[#f86823] transition">Help Center</Link></li>
                                    <li><Link href="#" className="hover:text-[#f86823] transition">Contact Us</Link></li>
                                    <li><Link href="#" className="hover:text-[#f86823] transition">Documentation</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4">Connect</h3>
                                <div className="flex space-x-4">
                                    <Link href="#" className="hover:text-[#f86823] transition"><i className="fab fa-twitter text-xl"></i></Link>
                                    <Link href="#" className="hover:text-[#f86823] transition"><i className="fab fa-linkedin text-xl"></i></Link>
                                    <Link href="#" className="hover:text-[#f86823] transition"><i className="fab fa-github text-xl"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 text-center text-[#d6d8e2]">
                            <p>© 2025 IAM SaaS. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

            </body>
        </>
    );
};

export default LandingPage;
