"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Tag,
  FileText,
  Power,
  AlertCircle,
  Hash
} from 'lucide-react';

interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  active: boolean;
}

export default function CreateCategoryPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <CreateCategoryContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function CreateCategoryContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      active: true,
    },
  });

  const watchName = watch('name');

  // Auto-generate slug when name changes
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...data,
        slug: data.slug || generateSlug(data.name),
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      const result = await response.json();
      router.push(`/admin/categories/${result.data.id}`);
    } catch (err: unknown) {
      console.error('Error creating category:', err);
      const error = err as { message?: string };
      setError(error.message || 'Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/categories"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại danh sách
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              <Tag className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Tạo danh mục mới
              </h1>
              <p className="text-gray-600">Thêm danh mục mới vào hệ thống</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin danh mục</h2>
            <p className="text-sm text-gray-600">Điền thông tin cần thiết cho danh mục mới</p>
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
                  <Tag className="h-4 w-4 text-gray-500" />
                  Tên danh mục
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên danh mục"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                  }`}
                  {...register('name', { 
                    required: 'Tên danh mục là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Tên danh mục phải có ít nhất 2 ký tự'
                    },
                    maxLength: {
                      value: 255,
                      message: 'Tên danh mục không được quá 255 ký tự'
                    }
                  })}
                  onChange={(e) => {
                    register('name').onChange(e);
                    // Auto-generate slug
                    if (!watch('slug')) {
                      setValue('slug', generateSlug(e.target.value));
                    }
                  }}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  Slug (URL thân thiện)
                </label>
                <input
                  type="text"
                  placeholder="Slug tự động từ tên danh mục"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.slug 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                  }`}
                  {...register('slug', {
                    maxLength: {
                      value: 255,
                      message: 'Slug không được quá 255 ký tự'
                    },
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'
                    }
                  })}
                />
                {errors.slug && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Để trống để tự động tạo từ tên danh mục
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Mô tả
              </label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả cho danh mục (tùy chọn)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300 transition-all duration-200 resize-none"
                {...register('description')}
              />
            </div>

            {/* Active Status */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Trạng thái</h3>
              
              <div className="flex items-start gap-3">
                <input
                  id="active"
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  {...register('active')}
                />
                <div className="flex-1">
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                    <Power className="h-4 w-4 text-green-500" />
                    Kích hoạt danh mục
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Danh mục được kích hoạt sẽ hiển thị và có thể được sử dụng trong hệ thống
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            {watchName && (
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-medium text-blue-800">Xem trước:</h4>
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600">Tên:</span>
                    <span className="font-medium">{watchName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">URL:</span>
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      /categories/{watch('slug') || generateSlug(watchName)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <Link
                href="/admin/categories"
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
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Tạo danh mục
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
