import React from 'react';
import { Calendar, Package, Save, Loader2, Edit, Trash2, Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
}

interface DistributionSetting {
  id?: number;
  user_id: number;
  distribution_date: string;
  order_sequence: number;
  product_id: number;
  notes?: string;
  status: 'active' | 'inactive';
  product?: Product;
}

interface DistributionListProps {
  distributions: DistributionSetting[];
  products: Product[];
  loading: boolean;
  onEdit: (distribution: DistributionSetting) => void;
  onDelete: (id: number) => void;
  onCreateNew: () => void;
  formatPrice: (price: number, salePrice?: number) => React.ReactNode;
}

export function DistributionList({
  distributions,
  products,
  loading,
  onEdit,
  onDelete,
  onCreateNew,
  formatPrice
}: DistributionListProps) {
  const getProductById = (id: number) => products.find(p => p.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải danh sách...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách cài đặt phân phối ({distributions.length})
        </h3>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </button>
      </div>

      {distributions.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có cài đặt phân phối nào</p>
          <p className="text-gray-400 text-sm mb-4">
            Tạo cài đặt phân phối để quản lý việc giao hàng cho người dùng này
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tạo cài đặt đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {distributions.map((distribution) => {
            const product = distribution.product || getProductById(distribution.product_id);

            return (
              <div key={distribution.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product?.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Distribution Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {product?.name || 'Sản phẩm không tồn tại'}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${distribution.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {distribution.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Ngày áp dụng:</strong> {new Date(distribution.distribution_date).toLocaleDateString('vi-VN')}
                        </div>
                        <div>
                          <strong>Đơn hàng thứ:</strong> {distribution.order_sequence}
                        </div>
                        {product && (
                          <div>
                            <strong>Giá:</strong> {formatPrice(product.price, product.sale_price)}
                          </div>
                        )}
                        {distribution.notes && (
                          <div>
                            <strong>Ghi chú:</strong> {distribution.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(distribution)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(distribution.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DistributionFormProps {
  formData: DistributionSetting;
  setFormData: React.Dispatch<React.SetStateAction<DistributionSetting>>;
  selectedProductId: number | null;
  products: Product[];
  loading: boolean;
  saving: boolean;
  editingDistribution: DistributionSetting | null;
  onProductSelect: (productId: number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formatPrice: (price: number, salePrice?: number) => React.ReactNode;
  getTomorrowDate: () => string;
  getTodayDate: () => string;
}

export function DistributionForm({
  formData,
  setFormData,
  selectedProductId,
  products,
  loading,
  saving,
  editingDistribution,
  onProductSelect,
  onSubmit,
  onCancel,
  formatPrice,
  getTodayDate
}: DistributionFormProps) {
  return (
    <div className="flex flex-col h-full">
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Date and Order Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Ngày áp dụng
                </label>
                <input
                  type="date"
                  value={formData.distribution_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, distribution_date: e.target.value }))}
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn hàng thứ
                </label>
                <select
                  value={formData.order_sequence}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_sequence: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Đơn thứ {num}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Tạm dừng</span>
                </label>
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn sản phẩm phân phối
              </label>

              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Đang tải sản phẩm...</span>
                </div>
              ) : (
                <>
                  <select
                    value={selectedProductId || ''}
                    onChange={(e) => onProductSelect(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - €{product.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </option>
                    ))}
                  </select>

                  {/* Product Preview */}
                  {selectedProductId && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {(() => {
                        const selectedProduct = products.find(p => p.id === selectedProductId);
                        return selectedProduct ? (
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {selectedProduct.image_url ? (
                                <img
                                  src={selectedProduct.image_url}
                                  alt={selectedProduct.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-product.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{selectedProduct.name}</h4>
                              {selectedProduct.description && (
                                <p className="text-sm text-gray-600 mb-2">{selectedProduct.description}</p>
                              )}
                              <div className="text-sm">
                                <strong>Giá:</strong> {formatPrice(selectedProduct.price, selectedProduct.sale_price)}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Nhập ghi chú về cài đặt phân phối này..."
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.notes?.length || 0}/1000 ký tự
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving || formData.product_id === 0}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingDistribution ? 'Đang cập nhật...' : 'Đang lưu...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingDistribution ? 'Cập nhật' : 'Lưu cài đặt'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
