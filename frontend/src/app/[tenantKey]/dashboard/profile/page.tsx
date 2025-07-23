'use client';

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const tenantKey = params.tenantKey as string;

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
      setLoading(false);
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile(tenantKey, profile);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      await userService.changePassword(tenantKey, passwordData);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card bg-white rounded-lg shadow p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" id="name" value={profile.name} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" id="email" value={profile.email} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Changes</button>
            </div>
          </form>
        </div>

        <div className="card bg-white rounded-lg shadow p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <input type="password" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input type="password" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input type="password" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Change Password</button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {/* MFA and Login History can be implemented here */}
      </div>
    </div>
  );
};

export default ProfilePage;