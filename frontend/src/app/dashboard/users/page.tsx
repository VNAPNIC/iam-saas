'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { FaUserPlus, FaDownload, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Define a more specific User interface
interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  // In a real app, you'd have role information here
  // role: string;
}

// Define the structure for a new user invitation
interface NewUser {
  name: string;
  email: string;
  role: string; // Role assignment
}

const UsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({ name: '', email: '', role: 'Viewer' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const response = await userService.listUsers();
        setUsers(response.data || []); // Ensure users is always an array
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users.');
        toast.error(error || 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    }
  }, [token, error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewUser(prev => ({ ...prev, [id]: value }));
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userService.invite({ name: newUser.name, email: newUser.email, role: newUser.role });
      toast.success(`Invitation sent to ${newUser.email}`);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', role: 'Viewer' });
      await fetchUsers(); // Refresh user list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to invite user.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        await fetchUsers(); // Refresh user list
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to delete user.';
        toast.error(errorMessage);
      }
    }
  };

  if (loading && users.length === 0) {
    return <div>Loading users...</div>;
  }

  return (
    <>
      {/* Header and Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <div className="flex space-x-2">
          <button onClick={() => setIsModalOpen(true)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
            <FaUserPlus className="mr-2" /> Add User
          </button>
          <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            <FaDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      {users.length === 0 && !loading ? (
        <div className="text-center card bg-white rounded-lg shadow p-8 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Get started by inviting the first member to your team.</p>
          <div className="mt-6">
            <button onClick={() => setIsModalOpen(true)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Invite First User
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-white rounded-lg shadow border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Admin</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><FaEdit /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 ml-4 dark:text-red-400 dark:hover:text-red-300"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Invite New User</h2>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" id="name" value={newUser.name} onChange={handleModalInputChange} className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" id="email" value={newUser.email} onChange={handleModalInputChange} className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select id="role" value={newUser.role} onChange={handleModalInputChange} className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Admin</option>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersPage;