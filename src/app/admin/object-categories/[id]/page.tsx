"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ObjectCategory } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Power,
  PowerOff,
  Package,
  FileText,
  Calendar,
  AlertCircle,
  Tag,
  Hash,
  Activity,
  Settings
} from 'lucide-react';

export default function ObjectCategoryDetailPage() {
  const params = useParams();
  const objectCategoryId = params.id as string;
  
  const [objectCategory, setObjectCategory] = useState<ObjectCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch object category details
  useEffect(() => {
    const fetchObjectCategory = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/object-categories/${objectCategoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch object category');
        }
        
        const result = await response.json();
        const objectCategoryData = result.data || result;
        setObjectCategory(objectCategoryData);
      } catch (err) {
        console.error('Error fetching object category:', err);
        setError('Không thể tải thông tin danh mục đối tượng');
      } finally {
        setLoading(false);
      }
    };

    if (objectCategoryId) {
      fetchObjectCategory();
    }
  }, [objectCategoryId]);

  const handleToggleActive = async () => {
    if (!objectCategory) return;

    try {
      const response = await fetch(`/api/object-categories/${objectCategoryId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle object category status');
      }

      const result = await response.json();
      setObjectCategory(result.data);
    } catch (err) {
      console.error('Error toggling object category status:', err);
      setError('Không thể cập nhật trạng thái danh mục đối tượng');
    }
  };

  const handleDelete = async () => {
    if (!objectCategory) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục đối tượng "${objectCategory.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/object-categories/${objectCategoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete object category');
      }

      // Redirect to object categories list
      window.location.href = '/admin/object-categories';
    } catch (err) {
      console.error('Error deleting object category:', err);
      setError(err instanceof Error ? err.message : 'Không thể xóa danh mục đối tượng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin danh mục đối tượng...</p>
        </div>
      </div>
    );
  }

  if (error && !objectCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            href="/admin/object-categories"
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!objectCategory) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-1xl mx-auto px-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/object-categories"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại danh sách
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {objectCategory.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {objectCategory.name}
                </h1>
                <p className="text-gray-600">Chi tiết danh mục đối tượng</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/object-categories/${objectCategoryId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Link>
              
              <button
                onClick={handleToggleActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  objectCategory.active
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {objectCategory.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                {objectCategory.active ? 'Tạm dừng' : 'Kích hoạt'}
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
                  <Package className="h-5 w-5 text-green-500" />
                  Thông tin cơ bản
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên danh mục đối tượng</label>
                    <p className="text-lg font-semibold text-gray-900">{objectCategory.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Danh mục cha
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {objectCategory.category?.name || 'Không có'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Slug
                    </label>
                    <p className="text-lg font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      /{objectCategory.slug}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Trạng thái
                    </label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                      objectCategory.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {objectCategory.active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                      {objectCategory.active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-lg font-semibold text-gray-900">#{objectCategory.id}</p>
                  </div>
                </div>

                {objectCategory.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
                      <FileText className="h-3 w-3" />
                      Mô tả
                    </label>
                    <p className="text-gray-700 leading-relaxed">{objectCategory.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Properties */}
            {objectCategory.properties && Object.keys(objectCategory.properties).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-500" />
                    Thuộc tính tùy chỉnh
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(objectCategory.properties).map(([key, value]) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{key}</h3>
                            <p className="text-sm text-gray-600 mt-1">{String(value)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                    {new Date(objectCategory.created_at).toLocaleDateString('vi-VN', {
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
                    {new Date(objectCategory.updated_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {objectCategory.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Danh mục cha</label>
                    <Link
                      href={`/admin/categories/${objectCategory.category.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 block"
                    >
                      {objectCategory.category.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/admin/object-categories/${objectCategoryId}/edit`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa danh mục đối tượng
                </Link>
                
                <button
                  onClick={handleToggleActive}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {objectCategory.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  {objectCategory.active ? 'Tạm dừng danh mục đối tượng' : 'Kích hoạt danh mục đối tượng'}
                </button>

                {objectCategory.category && (
                  <Link
                    href={`/admin/categories/${objectCategory.category.id}`}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Tag className="h-4 w-4" />
                    Xem danh mục cha
                  </Link>
                )}

                <hr className="my-2" />

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa danh mục đối tượng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
