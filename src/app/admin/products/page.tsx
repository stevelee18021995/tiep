"use client";

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters } from '@/types';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import Select from 'react-select';
import Link from 'next/link';
import axios from 'axios';
import '@/styles/react-select.css';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff,
  Power,
  PowerOff,
  Image,
} from 'lucide-react';

export default function ProductsPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <ProductsContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function ProductsContent() {
  const auth = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [filters, setFilters] = useState<ProductFilters>({
    per_page: 15,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [searchInput, setSearchInput] = useState(''); // Separate state for search input

  // Options for filter dropdowns
  const statusOptions = [
    { value: 'true', label: 'Đang hoạt động' },
    { value: 'false', label: 'Không hoạt động' },
  ];

  const featuredOptions = [
    { value: 'true', label: 'Sản phẩm nổi bật' },
    { value: 'false', label: 'Sản phẩm thường' },
  ];

  const promotionOptions = [
    { value: 'true', label: 'Đang khuyến mãi' },
    { value: 'false', label: 'Không khuyến mãi' },
  ];

  const sortOptions = [
    { value: 'created_at_desc', label: 'Mới nhất' },
    { value: 'created_at_asc', label: 'Cũ nhất' },
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' },
    { value: 'price_asc', label: 'Giá thấp đến cao' },
    { value: 'price_desc', label: 'Giá cao đến thấp' },
  ];

  type OptionType = {
    value: string;
    label: string;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.is_active !== undefined) count++;
    if (filters.is_featured !== undefined) count++;
    if (filters.on_promotion !== undefined) count++;
    if (filters.sort_by !== 'created_at' || filters.sort_order !== 'desc') count++;
    return count;
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = auth.token;
      if (!token) return;

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await axios.get(
        `/api/products?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setProducts(response.data.data.data);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [auth.token, filters]);

  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    fetchProducts(); // Trigger fetch manually
  }, [searchInput, fetchProducts]);

  const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
    // Remove automatic fetch - only fetch when search button is clicked or pagination changes
    if (newFilters.page) {
      fetchProducts(); // Only fetch for pagination changes
    }
  }, [fetchProducts]);

  const toggleProductStatus = async (productId: number, field: 'is_active' | 'is_featured') => {
    try {
      const token = auth.token;
      if (!token) return;

      const endpoint = field === 'is_active' ? 'toggle-active' : 'toggle-featured';

      await axios.put(
        `/api/products/${productId}/${endpoint}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error(`Error toggling product ${field}:`, error);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const token = auth.token;
      if (!token) return;

      await axios.delete(
        `/api/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const isOnPromotion = (product: Product) => {
    if (!product.sale_price || !product.promotion_start_date || !product.promotion_end_date) {
      return false;
    }
    const now = new Date();
    const start = new Date(product.promotion_start_date);
    const end = new Date(product.promotion_end_date);
    return now >= start && now <= end;
  };

  const getDiscountPercentage = (product: Product) => {
    if (!product.sale_price || !product.price) return 0;
    return Math.round(((product.price - product.sale_price) / product.price) * 100);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-1xl mx-auto px-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Quản lý sản phẩm
                </h1>
                <p className="text-gray-600">Quản lý thông tin sản phẩm và khuyến mãi</p>
              </div>
            </div>

            <Link
              href="/admin/products/create"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc tìm kiếm
              {getActiveFiltersCount() > 0 && (
                <>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {getActiveFiltersCount()} đang áp dụng
                  </span>
                  <button
                    onClick={() => {
                      setFilters({
                        per_page: 15,
                        sort_by: 'created_at',
                        sort_order: 'desc'
                      });
                      setSearchInput('');
                      fetchProducts(); // Fetch after clearing filters
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchInput}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>



            {/* Status Filter */}
            <Select
              placeholder="Tất cả trạng thái"
              options={statusOptions}
              value={statusOptions.find(option => option.value === (filters.is_active?.toString() || '')) || null}
              onChange={(option: OptionType | null) => handleFilterChange({ is_active: option ? option.value === 'true' : undefined })}
              isSearchable={false}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              menuPlacement="auto"
            />
            {/* Featured Filter */}
            <Select
              placeholder="Tất cả sản phẩm"
              options={featuredOptions}
              value={featuredOptions.find(option => option.value === (filters.is_featured?.toString() || '')) || null}
              onChange={(option: OptionType | null) => handleFilterChange({ is_featured: option ? option.value === 'true' : undefined })}
              isSearchable={false}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              menuPlacement="auto"
            />

            {/* Promotion Filter */}
            <Select
              placeholder="Tất cả khuyến mãi"
              options={promotionOptions}
              value={promotionOptions.find(option => option.value === (filters.on_promotion?.toString() || '')) || null}
              onChange={(option: OptionType | null) => handleFilterChange({ on_promotion: option ? option.value === 'true' : undefined })}
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Giá / Khuyến mãi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Image className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            {product.is_featured && (
                              <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                                <Star className="h-3 w-3" />
                                Nổi bật
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                          {isOnPromotion(product) && product.sale_price && (
                            <div className="space-y-1">
                              <div className="text-red-600 font-semibold">
                                {formatPrice(product.sale_price)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  -{getDiscountPercentage(product)}%
                                </span>
                                {product.promotion_code && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {product.promotion_code}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${product.stock_quantity > 0
                          ? product.stock_quantity > 10
                            ? 'text-green-600'
                            : 'text-amber-600'
                          : 'text-red-600'
                          }`}>
                          {product.stock_quantity} sản phẩm
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleProductStatus(product.id, 'is_active')}
                            className={`p-1 rounded transition-colors ${product.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                              }`}
                            title={product.is_active ? 'Tắt hoạt động' : 'Bật hoạt động'}
                          >
                            {product.is_active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, 'is_featured')}
                            className={`p-1 rounded transition-colors ${product.is_featured
                              ? 'text-purple-600 hover:bg-purple-50'
                              : 'text-gray-400 hover:bg-gray-50'
                              }`}
                            title={product.is_featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                          >
                            {product.is_featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa sản phẩm"
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
                  Hiển thị {((pagination.current_page - 1) * pagination.per_page) + 1} đến{' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} trong tổng số{' '}
                  {pagination.total} sản phẩm
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
