"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Assume authService is set up to handle the API call
import { authService } from '@/services/authService'; 

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tenantName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for step 1
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantName.trim()) {
        setError("Company name is required.");
        return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await authService.register(formData);
      
      alert("Registration successful! Please check your email for verification. Redirecting to login...");
      router.push('/login');

    } catch (err: any) {
      // Error handling based on the actual API response
      setError(err.response?.data?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Create Your Account</h1>
              <p className="text-sm text-gray-500">Step {step} of 2</p>
            </div>
          </div>

          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Enter your full name" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="name@company.com" required />
              </div>
              <div>
                <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" id="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="At least 8 characters" required />
              </div>
              <div>
                <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Re-enter your password" required />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" id="tenantName" value={formData.tenantName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Your company or project name" required />
              </div>
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                    Back
                </button>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-sm text-center mt-4 text-gray-600">
            Already have an account? <Link href="/login" className="text-blue-500 hover:text-blue-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
