"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import Link from 'next/link';
import { 
  Users, 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock,
  Shield,
  AlertCircle
} from 'lucide-react';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_admin: boolean;
}

export default function CreateUserPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <CreateUserContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function CreateUserContent() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserData>({
    defaultValues: {
      is_admin: false
    }
  });

  const password = watch('password');

  const onSubmit = async (data: CreateUserData) => {
    setLoading(true);
    setError(null);

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      router.push('/admin/users');
    } catch (err: unknown) {
      console.error('Error creating user:', err);
      
      // Enhanced error handling for validation errors
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data?.message || 'Có lỗi xảy ra khi tạo người dùng');
        }
      } else {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/users"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Thêm người dùng mới
              </h1>
              <p className="text-gray-600">Tạo tài khoản người dùng mới trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin người dùng</h2>
            <p className="text-sm text-gray-600">Điền đầy đủ thông tin để tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Có lỗi xảy ra</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Họ và tên
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                  }`}
                  {...register('name', { 
                    required: 'Họ và tên là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Họ và tên phải có ít nhất 2 ký tự'
                    }
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Địa chỉ email
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                  }`}
                  {...register('email', { 
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Địa chỉ email không hợp lệ'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  Mật khẩu
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                    }`}
                    {...register('password', { 
                      required: 'Mật khẩu là bắt buộc',
                      minLength: {
                        value: 8,
                        message: 'Mật khẩu phải có ít nhất 8 ký tự'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  Xác nhận mật khẩu
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password_confirmation 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                    }`}
                    {...register('password_confirmation', { 
                      required: 'Xác nhận mật khẩu là bắt buộc',
                      validate: value => value === password || 'Mật khẩu xác nhận không khớp'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>

            {/* Admin Role */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Quyền hạn</h3>
              
              <div className="flex items-start gap-3">
                <input
                  id="is_admin"
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  {...register('is_admin')}
                />
                <div className="flex-1">
                  <label htmlFor="is_admin" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Cấp quyền quản trị viên
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Quản trị viên có thể truy cập tất cả các chức năng trong hệ thống và quản lý người dùng khác
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <Link
                href="/admin/users"
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Hủy
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Tạo người dùng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
