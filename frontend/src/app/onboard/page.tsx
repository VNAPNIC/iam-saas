'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { AxiosError } from 'axios';
import { useTheme } from 'next-themes';
import { FaBuilding, FaPalette, FaUsers, FaCheck, FaCog, FaPlus, FaTrash } from 'react-icons/fa';

const OnboardPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { accessToken } = useAuthStore();
  const { theme, setTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    logoFile: null as File | null,
    defaultLanguage: 'vi',
    inviteEmail: '',
    inviteRole: 'Nhân viên',
  });

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // This is a simplified submission. In a real app, you'd send all the data.
      // For now, we just mark onboarding as complete.
      await apiClient.post('/tenant/complete-onboarding');
      router.push('/dashboard'); // Redirect to the main dashboard
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setErrors({ general: err.response.data.error || 'Failed to complete onboarding.' });
      } else {
        setErrors({ general: 'An unexpected error occurred.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const StepCircle = ({ num, label }: { num: number, label: string }) => (
    <div className={`step ${step >= num ? 'active' : ''}`} data-step={num}>
      <div className="step-circle">{num}</div>
      <p className="step-label">{label}</p>
    </div>
  );

  const ProgressBar = ({ num }: { num: number }) => (
     <div className={`flex-1 border-t-2 transition-colors duration-500 mx-4 ${step > num ? 'border-blue-500' : ''}`} id={`progress-bar-${num}`}></div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-gray-800 p-2 rounded-full shadow-md z-10">
        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>

      <div className="w-full max-w-2xl">
        <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <StepCircle num={1} label="Tùy chỉnh" />
              <ProgressBar num={1} />
              <StepCircle num={2} label="Mời thành viên" />
              <ProgressBar num={2} />
              <StepCircle num={3} label="Hoàn tất" />
            </div>
          </div>

          <div id="wizard-content">
            {/* Step 1: Branding */}
            <div id="step-1" className={`wizard-step ${step !== 1 ? 'hidden' : ''}`}>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tùy chỉnh Giao diện Tenant của bạn</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Cá nhân hóa hệ thống với logo và màu sắc thương hiệu.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo Công ty</label>
                  <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 dark:file:bg-blue-900 dark:file:text-blue-300 file:text-blue-700 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngôn ngữ Mặc định</label>
                  <select name="defaultLanguage" value={formData.defaultLanguage} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 text-right">
                <button onClick={() => goToStep(2)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Tiếp tục</button>
              </div>
            </div>

            {/* Step 2: Invite Team */}
            <div id="step-2" className={`wizard-step ${step !== 2 ? 'hidden' : ''}`}>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Mời thành viên đầu tiên</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Bắt đầu xây dựng đội nhóm của bạn.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email thành viên</label>
                  <input type="email" name="inviteEmail" value={formData.inviteEmail} onChange={handleInputChange} placeholder="nhap@email.com" className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gán vai trò</label>
                  <select name="inviteRole" value={formData.inviteRole} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600">
                    <option>Nhân viên</option>
                    <option>Quản lý</option>
                    <option>Kế toán</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => goToStep(1)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Quay lại</button>
                <button onClick={() => goToStep(3)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Mời & Tiếp tục</button>
              </div>
            </div>

            {/* Step 3: Complete */}
            <div id="step-3" className={`wizard-step text-center ${step !== 3 ? 'hidden' : ''}`}>
              <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Thiết lập Hoàn tất!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Bạn đã sẵn sàng để khám phá hệ thống IAM SaaS.</p>
              <div className="mt-8">
                <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-lg">
                  {loading ? 'Đang xử lý...' : 'Đi đến Dashboard'}
                </button>
              </div>
               {errors.general && <p className="text-red-500 mt-4">{errors.general}</p>}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .step .step-circle { width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; background-color: #e5e7eb; color: #4b5563; transition: all 0.5s; margin: 0 auto; }
        .dark .step .step-circle { background-color: #374151; color: #9ca3af; }
        .step .step-label { margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280; transition: all 0.5s; }
        .dark .step .step-label { color: #9ca3af; }
        .step.active .step-circle { background-color: #2563eb; color: white; }
        .dark .step.active .step-circle { background-color: #3b82f6; }
        .step.active .step-label { color: #2563eb; font-weight: 600; }
        .dark .step.active .step-label { color: #60a5fa; }
      `}</style>
    </div>
  );
};

export default OnboardPage;
