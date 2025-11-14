"use client";

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import Select from 'react-select';
import toast from 'react-hot-toast';
import DistributionSettingModal from '@/components/DistributionSettingModal';
import AddMoneyModal from '@/components/AddMoneyModal';
import '@/styles/react-select.css';

interface OptionType {
  value: string;
  label: string;
}
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  Eye,
  UserCheck,
  UserX,
  X,
  Settings,
  DollarSign
} from 'lucide-react';

export default function UsersPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <UsersContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function UsersContent() {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: undefined as string | undefined,
    is_admin: undefined as boolean | undefined,
    page: 1,
    per_page: 10
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: '',
    isDeleting: false
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  });

  // Distribution setting modal
  const [distributionModal, setDistributionModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: ''
  });

  // Add money modal
  const [addMoneyModal, setAddMoneyModal] = useState({
    isOpen: false,
    user: null as User | null,
  });

  console.log('Current addMoneyModal state:', addMoneyModal);

  // Options for filter dropdowns
  const roleOptions: OptionType[] = [
    { value: 'true', label: 'Quản trị viên' },
    { value: 'false', label: 'Người dùng thường' },
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.is_admin !== undefined) count++;
    return count;
  };

  const { user: currentUser } = auth;

  // Fetch users (for refresh after operations)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('per_page', filters.per_page.toString());

      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.is_admin !== undefined) {
        params.append('is_admin', filters.is_admin ? '1' : '0');
      }

      const queryString = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/users${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetch Users Response:', response.data);

      // Handle pagination data
      if (response.data.data) {
        setUsers(response.data.data);

        // Set pagination info if available
        if (response.data.meta) {
          setPagination({
            current_page: response.data.meta.current_page,
            last_page: response.data.meta.last_page,
            total: response.data.meta.total || response.data.data.length
          });
        } else {
          // Fallback if no meta data
          setPagination(prev => ({ ...prev, total: response.data.data.length }));
        }
      } else {
        setUsers(response.data || []);
        setPagination(prev => ({ ...prev, total: response.data?.length || 0 }));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [auth.token, filters]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    fetchUsers();
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
    // Auto fetch for non-search filters
    if (newFilters.is_admin !== undefined || newFilters.page) {
      setTimeout(() => fetchUsers(), 100); // Small delay to ensure state update
    }
  };

  useEffect(() => {
    if (auth.isInitialized && auth.token) {
      fetchUsers();
    }
  }, [auth.isInitialized, auth.token, fetchUsers]);

  // Auto fetch when filters change (except for search which is manual)
  useEffect(() => {
    if (auth.isInitialized && auth.token && filters.page > 1) {
      fetchUsers();
    }
  }, [filters.page, auth.isInitialized, auth.token, fetchUsers]);

  // Clear filters
  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      search: undefined,
      is_admin: undefined,
      page: 1,
      per_page: 10
    });
    fetchUsers(); // Reload data without filters
  };

  // Delete user
  const handleDeleteUser = (userId: number, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      isDeleting: false
    });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal.userId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteModal.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setDeleteModal({ isOpen: false, userId: null, userName: '', isDeleting: false });
      toast.success('Người dùng đã được xóa thành công!');
      await fetchUsers(); // Reload current search/filter
    } catch (err) {
      console.error('Error deleting user:', err);

      // Enhanced error handling
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'Không thể xóa người dùng';
        toast.error(message);
      } else {
        toast.error('Không thể xóa người dùng');
      }
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };  // Toggle admin status
  const handleToggleAdmin = async (userId: number) => {
    try {
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/toggle-admin`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success(`Quyền người dùng đã được cập nhật thành công!`);
      await fetchUsers(); // Reload current search/filter
    } catch (err) {
      console.error('Error updating user:', err);

      // Enhanced error handling
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'Không thể cập nhật quyền người dùng';
        toast.error(message);
      } else {
        toast.error('Không thể cập nhật quyền người dùng');
      }
    }
  };

  // Open distribution setting modal
  const handleDistributionSetting = (userId: number, userName: string) => {
    setDistributionModal({
      isOpen: true,
      userId,
      userName
    });
  };

  // Open add money modal
  const handleAddMoney = (user: User) => {
    console.log('Opening add money modal for user:', user);
    setAddMoneyModal({
      isOpen: true,
      user
    });
  };

  // Select/deselect users
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setBulkDeleteModal({ isOpen: true, isDeleting: false });
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      await Promise.all(
        selectedUsers.map(userId =>
          axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      );
      setSelectedUsers([]);
      setBulkDeleteModal({ isOpen: false, isDeleting: false });
      toast.success(`Đã xóa thành công ${selectedUsers.length} người dùng!`);
      await fetchUsers(); // Reload current search/filter
    } catch (err) {
      console.error('Error bulk deleting users:', err);
      toast.error('Không thể xóa các người dùng đã chọn');
      setBulkDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Wait for auth to initialize (after all hooks)
  if (!auth.isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Đang khởi tạo xác thực...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchUsers()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-1xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Quản lý người dùng
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Quản lý tài khoản và quyền hạn người dùng trong hệ thống {pagination.total > 0 && `(${pagination.total} người dùng)`}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc tìm kiếm
            {getActiveFiltersCount() > 0 && (
              <>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()} đang áp dụng
                </span>
                <button
                  onClick={handleClearFilters}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                  title="Xóa tất cả bộ lọc"
                >
                  <Filter className="h-3 w-3" />
                  Xóa bộ lọc
                </button>
              </>
            )}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchInput}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Role Filter */}
          <Select
            placeholder="Tất cả vai trò"
            options={roleOptions}
            value={roleOptions.find(option => option.value === (filters.is_admin?.toString() || '')) || null}
            onChange={(option: OptionType | null) => handleFilterChange({ is_admin: option ? option.value === 'true' : undefined })}
            isSearchable={false}
            isClearable={true}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPlacement="auto"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Xóa ({selectedUsers.length})
              </button>
            )}

            <Link
              href="/admin/users/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quản trị viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_admin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Người dùng thường</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.is_admin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Search className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Kết quả tìm kiếm</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <ShieldCheck className="h-3 w-3" />
                        Quản trị viên
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        <UserCheck className="h-3 w-3" />
                        Người dùng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => handleDistributionSetting(user.id, user.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cài đặt phân phối"
                      >
                        <Settings className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          console.log('Add money button clicked for user:', user);
                          handleAddMoney(user);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Cộng tiền vào tài khoản"
                      >
                        <DollarSign className="h-4 w-4" />
                      </button>

                      {user.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(user.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title={user.is_admin ? "Hủy quyền admin" : "Cấp quyền admin"}
                          >
                            {user.is_admin ? <UserX className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {users.map((user) => (
            <div key={user.id} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {user.is_admin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    <UserCheck className="h-3 w-3" />
                    User
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 mb-3">
                Ngày tạo: {new Date(user.created_at).toLocaleDateString('vi-VN')}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-blue-600 bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </Link>

                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-green-600 bg-green-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Sửa
                </Link>

                <button
                  onClick={() => handleDistributionSetting(user.id, user.name)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Cài đặt phân phối"
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    console.log('Add money button clicked (mobile) for user:', user);
                    handleAddMoney(user);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Cộng tiền vào tài khoản"
                >
                  <DollarSign className="h-4 w-4" />
                </button>

                {user.id !== currentUser?.id && (
                  <>
                    <button
                      onClick={() => handleToggleAdmin(user.id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title={user.is_admin ? "Hủy quyền admin" : "Cấp quyền admin"}
                    >
                      {user.is_admin ? <UserX className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa người dùng"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
            <p className="text-gray-400 text-sm">
              {searchInput || filters.is_admin !== undefined
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Chưa có người dùng nào trong hệ thống'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Hiển thị {((pagination.current_page - 1) * 10) + 1} đến {Math.min(pagination.current_page * 10, pagination.total)} trong tổng số {pagination.total} người dùng
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, page: Math.max(1, pagination.current_page - 1) }));
                  }}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                <div className="flex items-center gap-1">
                  {/* First page */}
                  {pagination.current_page > 3 && (
                    <>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        1
                      </button>
                      {pagination.current_page > 4 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Current page and surrounding pages */}
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    let pageNum;
                    if (pagination.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current_page >= pagination.last_page - 2) {
                      pageNum = pagination.last_page - 4 + i;
                    } else {
                      pageNum = pagination.current_page - 2 + i;
                    }

                    if (pageNum < 1 || pageNum > pagination.last_page) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${pageNum === pagination.current_page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Last page */}
                  {pagination.current_page < pagination.last_page - 2 && (
                    <>
                      {pagination.current_page < pagination.last_page - 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: pagination.last_page }))}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {pagination.last_page}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.last_page, pagination.current_page + 1) }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa người dùng</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: '', isDeleting: false })}
                disabled={deleteModal.isDeleting}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Bạn có chắc chắn muốn xóa người dùng{' '}
                      <span className="font-semibold">"{deleteModal.userName}"</span> không?
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Tất cả dữ liệu liên quan sẽ bị mất vĩnh viễn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: '', isDeleting: false })}
                  disabled={deleteModal.isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  disabled={deleteModal.isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {deleteModal.isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Xóa người dùng
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa nhiều người dùng</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>
              <button
                onClick={() => setBulkDeleteModal({ isOpen: false, isDeleting: false })}
                disabled={bulkDeleteModal.isDeleting}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Bạn có chắc chắn muốn xóa{' '}
                      <span className="font-semibold text-red-900">{selectedUsers.length} người dùng</span> được chọn không?
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Tất cả dữ liệu của {selectedUsers.length} người dùng này sẽ bị mất vĩnh viễn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBulkDeleteModal({ isOpen: false, isDeleting: false })}
                  disabled={bulkDeleteModal.isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  disabled={bulkDeleteModal.isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {bulkDeleteModal.isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xóa {selectedUsers.length} người dùng...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Xóa {selectedUsers.length} người dùng
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Setting Modal */}
      <DistributionSettingModal
        isOpen={distributionModal.isOpen}
        onClose={() => setDistributionModal({ isOpen: false, userId: null, userName: '' })}
        userId={distributionModal.userId!}
        userName={distributionModal.userName}
        onSuccess={() => {
          // Optional: Refresh data or show success message
          toast.success('Cài đặt phân phối đã được lưu thành công!');
        }}
      />

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={addMoneyModal.isOpen}
        onClose={() => {
          console.log('Closing add money modal');
          setAddMoneyModal({ isOpen: false, user: null });
        }}
        user={addMoneyModal.user}
        onSuccess={() => {
          console.log('Add money success callback');
          fetchUsers(); // Refresh user list to show updated balance
        }}
      />
    </div>
  );
}
