"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import { ProductFormData } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  Save,
  DollarSign,
  Tag,
  Image,
  Hash,
  FileText,
  Star,
  AlertCircle,
  Loader
} from 'lucide-react';

export default function EditProductPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <EditProductContent />
      </AdminLayout>
    </AuthGuard>
  );
}

// Component SpecificationsEditor
interface SpecificationsEditorProps {
  specifications: Array<{ key: string; value: string }>;
  onChange: (specifications: Array<{ key: string; value: string }>) => void;
}

function SpecificationsEditor({ specifications, onChange }: SpecificationsEditorProps) {
  const addSpecification = () => {
    onChange([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    const newSpecs = specifications.filter((_, i) => i !== index);
    onChange(newSpecs);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    onChange(newSpecs);
  };

  return (
    <div className="space-y-4">
      {specifications.map((spec, index) => (
        <div key={index} className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tên thông số (VD: Màn hình)"
              value={spec.key}
              onChange={(e) => updateSpecification(index, 'key', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Giá trị (VD: 6.1 inch OLED)"
              value={spec.value}
              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
          </div>
          <button
            type="button"
            onClick={() => removeSpecification(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSpecification}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
      >
        <Package className="h-4 w-4" />
        Thêm thông số
      </button>
    </div>
  );
}

function EditProductContent() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  const watchPrice = watch('price');
  const watchSalePrice = watch('sale_price');

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
          }
        });

        if (response.data.success) {
          const productData = response.data.data;
          setProduct(productData);

          // Reset form with product data
          reset({
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price || 0,
            sale_price: productData.sale_price || '',
            promotion_code: productData.promotion_code || '',
            promotion_start_date: productData.promotion_start_date || '',
            promotion_end_date: productData.promotion_end_date || '',
            stock_quantity: productData.stock_quantity || 0,
            sku: productData.sku || '',
            is_active: productData.is_active || false,
            is_featured: productData.is_featured || false,
            weight: productData.weight || '',
          });

          // Load specifications
          if (productData.specifications) {
            try {
              const specs = typeof productData.specifications === 'string'
                ? JSON.parse(productData.specifications)
                : productData.specifications;
              setSpecifications(Array.isArray(specs) ? specs : []);
            } catch (e) {
              console.error('Error parsing specifications:', e);
              setSpecifications([]);
            }
          }
        }
      } catch (err: unknown) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id && auth.token) {
      fetchProduct();
    }
  }, [params.id, auth.token, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Tạo FormData để hỗ trợ file upload
      const formData = new FormData();

      // Thêm các field dữ liệu
      Object.keys(data).forEach(key => {
        const value = data[key as keyof ProductFormData];

        if (key === 'image' && value instanceof FileList && value.length > 0) {
          formData.append('image', value[0]);
        } else if (key === 'gallery' && value instanceof FileList) {
          for (let i = 0; i < value.length; i++) {
            formData.append('gallery[]', value[i]);
          }
        } else if (key === 'is_active' || key === 'is_featured') {
          // Xử lý đặc biệt cho các field boolean
          formData.append(key, value ? '1' : '0');
        } else if (value !== null && value !== undefined && value !== '') {
          // Các field khác
          if (typeof value !== 'object') {
            formData.append(key, value.toString());
          }
        }
      });

      // Thêm specifications từ state (luôn gửi, kể cả khi rỗng)
      formData.append('specifications', JSON.stringify(specifications));

      // Thêm method spoofing cho Laravel
      formData.append('_method', 'PUT');

      await axios.post(`/api/products/${params.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      router.push('/admin/products');
    } catch (err: unknown) {
      console.error('Error updating product:', err);

      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
        }
      } else {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDiscountPercentage = () => {
    if (watchPrice && watchSalePrice && watchPrice > 0) {
      return Math.round(((watchPrice - watchSalePrice) / watchPrice) * 100);
    }
    return 0;
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-lg font-medium text-gray-700">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Chỉnh sửa sản phẩm
              </h1>
              <p className="text-gray-600">Cập nhật thông tin sản phẩm: {product.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
              <p className="text-sm text-gray-600">Cập nhật thông tin cơ bản của sản phẩm</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    Tên sản phẩm
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.name
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300'
                      }`}
                    {...register('name', {
                      required: 'Tên sản phẩm là bắt buộc',
                      minLength: {
                        value: 2,
                        message: 'Tên sản phẩm phải có ít nhất 2 ký tự'
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

                {/* SKU */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    Mã sản phẩm (SKU)
                  </label>
                  <input
                    type="text"
                    placeholder="Mã sản phẩm"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300 transition-all duration-200"
                    {...register('sku')}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300 transition-all duration-200 resize-none"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Promotion */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Giá bán & Khuyến mãi</h2>
              <p className="text-sm text-gray-600">Cập nhật giá bán và chương trình khuyến mãi</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Giá bán
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.price
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300'
                      }`}
                    {...register('price', {
                      required: 'Giá bán là bắt buộc',
                      min: {
                        value: 0,
                        message: 'Giá bán phải lớn hơn hoặc bằng 0'
                      }
                    })}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Sale Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    Giá khuyến mãi
                    {getDiscountPercentage() > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">
                        -{getDiscountPercentage()}%
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300 transition-all duration-200"
                    {...register('sale_price', {
                      min: {
                        value: 0,
                        message: 'Giá khuyến mãi phải lớn hơn hoặc bằng 0'
                      }
                    })}
                  />
                  {errors.sale_price && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sale_price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Rest of the form... Similar to create page but for editing */}
              {/* Stock Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Số lượng tồn kho
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.stock_quantity
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300'
                    }`}
                  {...register('stock_quantity', {
                    required: 'Số lượng tồn kho là bắt buộc',
                    min: {
                      value: 0,
                      message: 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'
                    }
                  })}
                />
                {errors.stock_quantity && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.stock_quantity.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images & Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Hình ảnh & Thiết lập</h2>
              <p className="text-sm text-gray-600">Cập nhật hình ảnh và cài đặt sản phẩm</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Images Display */}
              {product.image_url && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hình ảnh hiện tại</label>
                  <div className="flex gap-4">
                    <img
                      src={product.image_url}
                      alt="Current product image"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Image className="h-4 w-4 text-gray-500" />
                  Cập nhật hình ảnh chính
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  {...register('image')}
                />
                <p className="text-xs text-gray-500">
                  Để trống nếu không muốn thay đổi. Hỗ trợ: JPG, PNG, GIF. Tối đa 2MB.
                </p>
              </div>

              {/* Gallery Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Image className="h-4 w-4 text-gray-500" />
                  Cập nhật thư viện ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 hover:border-gray-300 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  {...register('gallery')}
                />
                <p className="text-xs text-gray-500">
                  Để trống nếu không muốn thay đổi. Chọn nhiều ảnh. Hỗ trợ: JPG, PNG, GIF. Tối đa 2MB mỗi ảnh.
                </p>
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
                <SpecificationsEditor
                  specifications={specifications}
                  onChange={setSpecifications}
                />
              </div>

              {/* Status Settings */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    id="is_active"
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    {...register('is_active')}
                  />
                  <div className="flex-1">
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Kích hoạt sản phẩm
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Sản phẩm sẽ hiển thị trong danh sách và có thể mua bán
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="is_featured"
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    {...register('is_featured')}
                  />
                  <div className="flex-1">
                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                      <Star className="h-4 w-4 text-amber-500" />
                      Sản phẩm nổi bật
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Sản phẩm sẽ được ưu tiên hiển thị trong các khu vực đặc biệt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Hủy
            </Link>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Cập nhật sản phẩm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
