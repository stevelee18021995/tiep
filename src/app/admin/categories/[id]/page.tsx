"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Category, ObjectCategory } from '@/types';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Tag,
  FileText,
  Calendar,
  AlertCircle,
  Package,
  Plus,
  Hash,
  Activity
} from 'lucide-react';

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [objectCategories, setObjectCategories] = useState<ObjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }

        const result = await response.json();
        const categoryData = result.data || result;
        setCategory(categoryData);
        setObjectCategories(categoryData.object_categories || []);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Không thể tải thông tin danh mục');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleToggleActive = async () => {
    if (!category) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle category status');
      }

      const result = await response.json();
      setCategory(result.data);
    } catch (err) {
      console.error('Error toggling category status:', err);
      setError('Không thể cập nhật trạng thái danh mục');
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      // Redirect to categories list
      window.location.href = '/admin/categories';
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err.message : 'Không thể xóa danh mục');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin danh mục...</p>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            href="/admin/categories"
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-1xl mx-auto px-1">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {category.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {category.name}
                </h1>
                <p className="text-gray-600">Chi tiết danh mục</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/categories/${categoryId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Link>

              <button
                onClick={handleToggleActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category.active
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
              >
                {category.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                {category.active ? 'Tạm dừng' : 'Kích hoạt'}
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-500" />
                  Thông tin cơ bản
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên danh mục</label>
                    <p className="text-lg font-semibold text-gray-900">{category.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Slug
                    </label>
                    <p className="text-lg font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      /{category.slug}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Trạng thái
                    </label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${category.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {category.active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                      {category.active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-lg font-semibold text-gray-900">#{category.id}</p>
                  </div>
                </div>

                {category.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
                      <FileText className="h-3 w-3" />
                      Mô tả
                    </label>
                    <p className="text-gray-700 leading-relaxed">{category.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Object Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  Danh mục đối tượng ({objectCategories.length})
                </h2>
                <Link
                  href={`/admin/object-categories/create?category_id=${categoryId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Thêm danh mục đối tượng
                </Link>
              </div>
              <div className="p-6">
                {objectCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {objectCategories.map((objCategory) => (
                      <div key={objCategory.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{objCategory.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">/{objCategory.slug}</p>
                            {objCategory.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{objCategory.description}</p>
                            )}
                          </div>
                          <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${objCategory.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {objCategory.active ? <Power className="h-2 w-2" /> : <PowerOff className="h-2 w-2" />}
                            {objCategory.active ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Link
                            href={`/admin/object-categories/${objCategory.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Xem chi tiết
                          </Link>
                          <Link
                            href={`/admin/object-categories/${objCategory.id}/edit`}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Chỉnh sửa
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có danh mục đối tượng nào</p>
                    <Link
                      href={`/admin/object-categories/create?category_id=${categoryId}`}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Tạo danh mục đối tượng đầu tiên
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Thông tin
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-sm text-gray-900">
                    {new Date(category.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cập nhật cuối</label>
                  <p className="text-sm text-gray-900">
                    {new Date(category.updated_at).toLocaleDateString('vi-VN', {
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

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/admin/categories/${categoryId}/edit`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa danh mục
                </Link>

                <button
                  onClick={handleToggleActive}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {category.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  {category.active ? 'Tạm dừng danh mục' : 'Kích hoạt danh mục'}
                </button>

                <Link
                  href={`/admin/object-categories/create?category_id=${categoryId}`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Thêm danh mục đối tượng
                </Link>

                <hr className="my-2" />

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa danh mục
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
