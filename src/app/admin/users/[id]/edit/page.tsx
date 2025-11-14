"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { User } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  User as UserIcon, 
  Mail, 
  Shield,
  AlertCircle,
  Key,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface EditUserData {
  name: string;
  email: string;
  is_admin: boolean;
}

export default function EditUserPage() {
  return <EditUserContent />;
}

function EditUserContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditUserData>();

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const result = await response.json();
        const userData = result.data || result;
        setUser(userData);
        
        // Set form values
        setValue('name', userData.name);
        setValue('email', userData.email);
        setValue('is_admin', userData.is_admin);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, setValue]);

  const onSubmit = async (data: EditUserData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      router.push(`/admin/users/${userId}`);
    } catch (err: unknown) {
      console.error('Error updating user:', err);
      
      // Enhanced error handling for validation errors
      const error = err as { message?: string };
      setError(error.message || 'Có lỗi xảy ra khi cập nhật người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Bạn có chắc chắn muốn cấp lại mật khẩu cho người dùng này?')) {
      return;
    }

    setResettingPassword(true);
    setError(null);
    setPasswordResetSuccess(false);

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      const result = await response.json();
      setNewPassword(result.data.new_password);
      setPasswordResetSuccess(true);
      setShowPassword(true);
    } catch (err: unknown) {
      console.error('Error resetting password:', err);
      const error = err as { message?: string };
      setError(error.message || 'Có lỗi xảy ra khi cấp lại mật khẩu');
    } finally {
      setResettingPassword(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
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

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            href="/admin/users"
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/admin/users/${userId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Chỉnh sửa người dùng
              </h1>
              <p className="text-gray-600">Cập nhật thông tin cho {user.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin người dùng</h2>
            <p className="text-sm text-gray-600">Cập nhật thông tin cần thiết</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Success Alert for Password Reset */}
            {passwordResetSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm flex items-start gap-3">
                <Key className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Mật khẩu đã được cấp lại thành công!</p>
                  <p className="text-sm mt-1">Vui lòng cuộn xuống để xem mật khẩu mới và gửi cho người dùng.</p>
                </div>
              </div>
            )}

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
                  <UserIcon className="h-4 w-4 text-gray-500" />
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

            {/* Password Reset Section */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Quản lý mật khẩu
              </h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800">Cấp lại mật khẩu</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Hệ thống sẽ tạo mật khẩu mới ngẫu nhiên cho người dùng này. Hãy đảm bảo thông báo mật khẩu mới cho họ.
                    </p>
                    
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resettingPassword}
                        className={`flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors ${
                          resettingPassword ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {resettingPassword ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang cấp lại...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Cấp lại mật khẩu
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Password Display */}
              {passwordResetSuccess && newPassword && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-800">Mật khẩu mới đã được tạo</h4>
                      <p className="text-xs text-green-700 mt-1">
                        Vui lòng sao chép mật khẩu dưới đây và gửi cho người dùng:
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            readOnly
                            className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
                          title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(newPassword)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                          title="Sao chép mật khẩu"
                        >
                          <Copy className="h-3 w-3" />
                          Sao chép
                        </button>
                      </div>
                      
                      <p className="text-xs text-green-600 mt-2">
                        ⚠️ Lưu ý: Hãy gửi mật khẩu này cho người dùng qua kênh liên lạc an toàn và yêu cầu họ đổi mật khẩu sau lần đăng nhập đầu tiên.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Info Display */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Thông tin hiện tại:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-medium">#{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Ngày tạo:</span>
                  <span className="ml-2 font-medium">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Cập nhật cuối:</span>
                  <span className="ml-2 font-medium">
                    {new Date(user.updated_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Vai trò hiện tại:</span>
                  <span className="ml-2 font-medium">
                    {user.is_admin ? 'Quản trị viên' : 'Người dùng'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <Link
                href={`/admin/users/${userId}`}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Hủy
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  saving ? 'opacity-70 cursor-not-allowed transform-none' : ''
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Cập nhật
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
