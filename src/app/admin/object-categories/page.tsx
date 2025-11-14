"use client";

import { useState, useEffect, useCallback } from 'react';
import { ObjectCategory, Category } from '@/types';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import Select from 'react-select';
import '@/styles/react-select.css';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  Package,
  FileText,
  Calendar,
  AlertCircle,
  RefreshCw,
  Tag
} from 'lucide-react';

export default function ObjectCategoriesPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <ObjectCategoriesContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function ObjectCategoriesContent() {
  const [objectCategories, setObjectCategories] = useState<ObjectCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(''); // Separate state for search input
  const [filters, setFilters] = useState({
    search: undefined as string | undefined,
    active: undefined as boolean | undefined,
    category_id: undefined as string | undefined,
    sort_by: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc',
    page: 1,
    per_page: 15
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  // Options for filter dropdowns
  const statusOptions = [
    { value: 'true', label: 'Đang hoạt động' },
    { value: 'false', label: 'Tạm dừng' },
  ];

  const sortOptions = [
    { value: 'created_at_desc', label: 'Mới nhất' },
    { value: 'created_at_asc', label: 'Cũ nhất' },
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' },
  ];

  type OptionType = {
    value: string;
    label: string;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.active !== undefined) count++;
    if (filters.category_id) count++;
    if (filters.sort_by !== 'created_at' || filters.sort_order !== 'desc') count++;
    return count;
  };

  // Create category options for select dropdown
  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name
  }));

  const fetchObjectCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('per_page', filters.per_page.toString());
      params.append('sort_by', filters.sort_by);
      params.append('sort_order', filters.sort_order);

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.active !== undefined) {
        params.append('active', filters.active ? 'true' : 'false');
      }

      if (filters.category_id) {
        params.append('category_id', filters.category_id);
      }

      const response = await fetch(`/api/object-categories?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch object categories');
      }

      const result = await response.json();
      setObjectCategories(result.data || []);

      if (result.meta) {
        setPagination({
          current_page: result.meta.current_page,
          last_page: result.meta.last_page,
          total: result.meta.total
        });
      }
    } catch (err) {
      console.error('Error fetching object categories:', err);
      setError('Không thể tải danh sách danh mục đối tượng');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories?per_page=100&active=true');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      setCategories(result.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    fetchObjectCategories();
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
    if (newFilters.page) {
      fetchObjectCategories(); // Only fetch for pagination changes
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchObjectCategories();
  }, [fetchObjectCategories]);

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`/api/object-categories/${id}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle object category status');
      }

      fetchObjectCategories();
    } catch (err) {
      console.error('Error toggling object category status:', err);
      setError('Không thể cập nhật trạng thái danh mục đối tượng');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục đối tượng "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/object-categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete object category');
      }

      fetchObjectCategories();
    } catch (err) {
      console.error('Error deleting object category:', err);
      setError(err instanceof Error ? err.message : 'Không thể xóa danh mục đối tượng');
    }
  };

  if (loading && objectCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách danh mục đối tượng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-1xl mx-auto px-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Quản lý danh mục đối tượng
                </h1>
                <p className="text-gray-600">Quản lý các danh mục đối tượng trong hệ thống ({pagination.total} danh mục đối tượng)</p>
              </div>
            </div>

            <Link
              href="/admin/object-categories/create"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              Thêm danh mục đối tượng
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Có lỗi xảy ra</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchObjectCategories}
              className="ml-auto p-2 text-red-600 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc tìm kiếm
              {getActiveFiltersCount() > 0 && (
                <>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {getActiveFiltersCount()} đang áp dụng
                  </span>
                  <button
                    onClick={() => {
                      setFilters({
                        search: undefined,
                        active: undefined,
                        category_id: undefined,
                        sort_by: 'created_at',
                        sort_order: 'desc',
                        page: 1,
                        per_page: 15
                      });
                      setSearchInput('');
                      fetchObjectCategories();
                    }}
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục đối tượng..."
                value={searchInput}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Category Filter */}
            <Select
              placeholder="Tất cả danh mục"
              options={categoryOptions}
              value={categoryOptions.find(option => option.value === filters.category_id) || null}
              onChange={(option: OptionType | null) => handleFilterChange({ category_id: option?.value })}
              isSearchable={true}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              menuPlacement="auto"
            />

            {/* Status Filter */}
            <Select
              placeholder="Tất cả trạng thái"
              options={statusOptions}
              value={statusOptions.find(option => option.value === (filters.active?.toString() || '')) || null}
              onChange={(option: OptionType | null) => handleFilterChange({ active: option ? option.value === 'true' : undefined })}
              isSearchable={false}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              menuPlacement="auto"
            />

            {/* Sort Filter */}
            <Select
              placeholder="Sắp xếp"
              options={sortOptions}
              value={sortOptions.find(option => {
                const [sortBy, sortOrder] = (option.value as string).split('_');
                return filters.sort_by === sortBy && filters.sort_order === sortOrder;
              }) || null}
              onChange={(option: OptionType | null) => {
                if (option?.value) {
                  const [sortBy, sortOrder] = (option.value as string).split('_');
                  handleFilterChange({ sort_by: sortBy, sort_order: sortOrder as 'asc' | 'desc' });
                } else {
                  handleFilterChange({ sort_by: 'created_at', sort_order: 'desc' });
                }
              }}
              isSearchable={false}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              menuPlacement="auto"
            />

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Object Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Tên danh mục đối tượng
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Danh mục cha
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Mô tả
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày tạo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : objectCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có danh mục đối tượng nào</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {filters.search || filters.active !== undefined || filters.category_id
                            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                            : 'Hãy tạo danh mục đối tượng đầu tiên'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  objectCategories.map((objectCategory) => (
                    <tr key={objectCategory.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {objectCategory.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{objectCategory.name}</p>
                            <p className="text-sm text-gray-500">/{objectCategory.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {objectCategory.category ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            <Tag className="h-3 w-3" />
                            {objectCategory.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Không có danh mục</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 max-w-xs truncate">
                          {objectCategory.description || 'Không có mô tả'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${objectCategory.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {objectCategory.active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                          {objectCategory.active ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(objectCategory.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/object-categories/${objectCategory.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/object-categories/${objectCategory.id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleActive(objectCategory.id)}
                            className={`p-2 rounded-lg transition-colors ${objectCategory.active
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={objectCategory.active ? 'Tạm dừng' : 'Kích hoạt'}
                          >
                            {objectCategory.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(objectCategory.id, objectCategory.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {objectCategories.length} / {pagination.total} danh mục đối tượng
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilterChange({ page: pagination.current_page - 1 })}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-2 text-sm">
                    Trang {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handleFilterChange({ page: pagination.current_page + 1 })}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
