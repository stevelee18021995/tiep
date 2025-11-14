"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  Edit,
  DollarSign,
  Tag,
  Calendar,
  Image,
  Hash,
  FileText,
  Star,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  Weight,
  BarChart3
} from 'lucide-react';

export default function ViewProductPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <ViewProductContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function ViewProductContent() {
  const params = useParams();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = auth.token;
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await axios.get(`/api/products/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Product data:', response.data);
        if (response.data.success) {
          setProduct(response.data.data);
        }
      } catch (err: unknown) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && auth.token) {
      fetchProduct();
    }
  }, [params.id, auth.token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getDiscountPercentage = () => {
    if (product?.price && product?.sale_price && product.price > 0) {
      return Math.round(((product.price - product.sale_price) / product.price) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-lg font-medium text-gray-700">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-6">{error || 'Sản phẩm bạn đang tìm kiếm không tồn tại.'}</p>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Chi tiết sản phẩm
                </h1>
                <p className="text-sm text-gray-600">Thông tin chi tiết về sản phẩm</p>
              </div>
            </div>

            <Link
              href={`/admin/products/${params.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit className="h-5 w-5" />
              Chỉnh sửa
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Thông tin cơ bản
                </h2>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên sản phẩm</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{product.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Mã SKU
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {product.sku || 'Chưa có'}
                    </p>
                  </div>
                </div>

                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Mô tả
                    </label>
                    <p className="text-gray-700 mt-1 leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Thông tin giá
                </h2>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giá bán</label>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  {product.sale_price && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Giá khuyến mãi
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(product.sale_price)}
                        </p>
                        {getDiscountPercentage() > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            -{getDiscountPercentage()}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Số lượng tồn kho
                    </label>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {product.stock_quantity}
                    </p>
                  </div>
                </div>

                {product.promotion_code && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-500">Mã khuyến mãi</label>
                    <p className="text-lg font-semibold text-purple-600 mt-1">
                      {product.promotion_code}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            {product.image_url && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Image className="h-5 w-5 text-blue-600" />
                    Hình ảnh sản phẩm
                  </h2>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Gallery images if available */}
                    {product.gallery && JSON.parse(product.gallery).map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Trạng thái</h2>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                  <div className="flex items-center gap-2">
                    {product.is_active ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Đã kích hoạt</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium text-red-700">Chưa kích hoạt</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nổi bật</span>
                  <div className="flex items-center gap-2">
                    {product.is_featured ? (
                      <>
                        <Star className="h-5 w-5 text-amber-500 fill-current" />
                        <span className="text-sm font-medium text-amber-700">Nổi bật</span>
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Thường</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h2>
              </div>

              <div className="p-4 space-y-3">
                {product.weight && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Weight className="h-4 w-4" />
                      Cân nặng
                    </label>
                    <p className="text-sm text-gray-700 mt-1">{product.weight} kg</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Ngày tạo
                  </label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(product.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Cập nhật lần cuối
                  </label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(product.updated_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Thông số kỹ thuật
                  </h2>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {JSON.parse(product.specifications).map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm font-medium text-gray-700">{spec.key}</span>
                        <span className="text-sm text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Promotion Dates */}
            {(product.promotion_start_date || product.promotion_end_date) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Thời gian khuyến mãi</h2>
                </div>

                <div className="p-4 space-y-3">
                  {product.promotion_start_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {new Date(product.promotion_start_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}

                  {product.promotion_end_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {new Date(product.promotion_end_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
