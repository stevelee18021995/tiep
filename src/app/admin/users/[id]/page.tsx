"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { User } from '@/types';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';

export default function UserDetailPage() {
  return <UserDetailContent />;
}

function UserDetailContent() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch user details
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [userId, auth.token]);

  useEffect(() => {
    if (userId && auth.isInitialized && auth.token) {
      fetchUser();
    }
  }, [userId, auth.isInitialized, auth.token, fetchUser]);

  // Delete user
  const handleDeleteUser = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) return;

    try {
      setActionLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
      toast.success('Người dùng đã được xóa thành công!');
      router.push('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Không thể xóa người dùng');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle admin status
  const handleToggleAdmin = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/toggle-admin`, {}, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Quyền người dùng đã được cập nhật thành công!');
      await fetchUser();
    } catch (err) {
      console.error('Error updating user:', err);

      // Enhanced error handling
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'Không thể cập nhật quyền người dùng';
        toast.error(message);
      } else {
        toast.error('Không thể cập nhật quyền người dùng');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error || 'Không tìm thấy người dùng'}</p>
          <div className="mt-4 space-x-4">
            <button
              onClick={fetchUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/users"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại danh sách
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user.is_admin ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      <ShieldCheck className="h-4 w-4" />
                      Quản trị viên
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      <UserCheck className="h-4 w-4" />
                      Người dùng
                    </span>
                  )}
                  <span className="text-sm text-gray-500">ID: {user.id}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/users/${user.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Link>

              <button
                onClick={handleToggleAdmin}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {user.is_admin ? <UserX className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {user.is_admin ? 'Hủy Admin' : 'Cấp Admin'}
              </button>

              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                Thông tin cá nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{user.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Vai trò</label>
                  <div className="mt-1">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg">
                        <ShieldCheck className="h-4 w-4" />
                        Quản trị viên
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                        <UserCheck className="h-4 w-4" />
                        Người dùng thường
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">ID người dùng</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">#{user.id}</p>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Hoạt động tài khoản
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Lần cập nhật cuối</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(user.updated_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>

              <div className="space-y-3">
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="flex items-center gap-3 w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <Edit className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">Chỉnh sửa thông tin</span>
                </Link>

                <button
                  onClick={handleToggleAdmin}
                  disabled={actionLoading}
                  className="flex items-center gap-3 w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group disabled:opacity-50"
                >
                  {user.is_admin ? <UserX className="h-5 w-5 text-purple-600" /> : <Shield className="h-5 w-5 text-purple-600" />}
                  <span className="text-purple-700 font-medium">
                    {user.is_admin ? 'Hủy quyền Admin' : 'Cấp quyền Admin'}
                  </span>
                </button>

                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex items-center gap-3 w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors group disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 font-medium">Xóa người dùng</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Hoạt động
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loại tài khoản</span>
                  <span className="text-gray-900 font-medium">
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian tạo</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
