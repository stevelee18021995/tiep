import React, { useState, useEffect } from 'react';
import { X, Settings, List } from 'lucide-react';
import { DistributionList, DistributionForm } from './DistributionComponents';
import { toast } from 'react-hot-toast';

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

interface DistributionSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName?: string;
  onSuccess?: () => void;
}

export default function DistributionSettingModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess
}: DistributionSettingModalProps) {
  function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingDistribution, setEditingDistribution] = useState<DistributionSetting | null>(null);
  const [distributions, setDistributions] = useState<DistributionSetting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DistributionSetting>({
    user_id: userId,
    distribution_date: getTodayDate(),
    order_sequence: 1,
    product_id: 0,
    notes: '',
    status: 'active'
  });

  const formatPrice = (price: number, salePrice?: number) => {
    if (salePrice && salePrice < price) {
      return (
        <span>
          <span className="text-red-500 font-medium">
            €{salePrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-gray-400 line-through ml-2">
            €{price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </span>
      );
    }
    return <span className="font-medium">€{price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  };

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user-setting-distributions?user_id=${userId}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Distributions response:', result); // Debug log

        // Handle paginated response structure
        if (result.success && result.data) {
          const distributionsData = result.data.data || result.data; // Handle both paginated and non-paginated
          setDistributions(Array.isArray(distributionsData) ? distributionsData : []);
        } else {
          setDistributions([]);
        }
      } else {
        console.error('Failed to fetch distributions:', response.status);
        setDistributions([]);
      }
    } catch (error) {
      console.error('Error fetching distributions:', error);
      toast.error('Lỗi khi tải danh sách phân phối');
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/user-setting-distributions/products/available');
      if (response.ok) {
        const result = await response.json();
        console.log('Products response:', result); // Debug log

        // Handle response structure
        if (result.success && result.data) {
          setProducts(Array.isArray(result.data) ? result.data : []);
        } else if (Array.isArray(result)) {
          // Fallback for direct array response
          setProducts(result);
        } else {
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi khi tải danh sách sản phẩm');
      setProducts([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDistributions();
      fetchProducts();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      product_id: selectedProductId || 0
    }));
  }, [selectedProductId]);

  const handleEdit = (distribution: DistributionSetting) => {
    setEditingDistribution(distribution);
    setFormData(distribution);
    setSelectedProductId(distribution.product_id || null);
    setActiveTab('form');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cài đặt phân phối này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user-setting-distributions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Xóa cài đặt phân phối thành công');
        fetchDistributions();
      } else {
        toast.error('Lỗi khi xóa cài đặt phân phối');
      }
    } catch (error) {
      console.error('Error deleting distribution:', error);
      toast.error('Lỗi khi xóa cài đặt phân phối');
    }
  };

  const handleFormSuccess = () => {
    setEditingDistribution(null);
    setFormData({
      user_id: userId,
      distribution_date: getTodayDate(),
      order_sequence: 1,
      product_id: 0,
      notes: '',
      status: 'active'
    });
    setSelectedProductId(null);
    setActiveTab('list');
    fetchDistributions();

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCreateNew = () => {
    setEditingDistribution(null);
    setFormData({
      user_id: userId,
      distribution_date: getTodayDate(),
      order_sequence: 1,
      product_id: 0,
      notes: '',
      status: 'active'
    });
    setSelectedProductId(null);
    setActiveTab('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.product_id === 0) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    try {
      setSaving(true);
      const url = editingDistribution
        ? `/api/user-setting-distributions/${editingDistribution.id}`
        : '/api/user-setting-distributions';

      // Đảm bảo user_id luôn được gửi
      const requestData = {
        ...formData,
        user_id: userId
      };

      console.log('Sending request data:', requestData); // Debug log

      const response = await fetch(url, {
        method: editingDistribution ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success(editingDistribution ? 'Cập nhật thành công' : 'Tạo cài đặt thành công');
        handleFormSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving distribution:', error);
      toast.error('Lỗi khi lưu cài đặt phân phối');
    } finally {
      setSaving(false);
    }
  };

  const handleProductSelect = (productId: number | null) => {
    setSelectedProductId(productId);
  };

  const handleCancel = () => {
    setActiveTab('list');
    setEditingDistribution(null);
    setFormData({
      user_id: userId,
      distribution_date: getTodayDate(),
      order_sequence: 1,
      product_id: 0,
      notes: '',
      status: 'active'
    });
    setSelectedProductId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Cài đặt phân phối</h2>
            {userName && (
              <p className="text-sm text-gray-600 mt-1">Cho người dùng: {userName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'list'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <List className="w-4 h-4" />
            Danh sách phân phối
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'form'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <Settings className="w-4 h-4" />
            {editingDistribution ? 'Chỉnh sửa phân phối' : 'Tạo phân phối mới'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'list' && (
            <DistributionList
              distributions={distributions}
              products={products}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
              formatPrice={formatPrice}
            />
          )}
          {activeTab === 'form' && (
            <DistributionForm
              formData={formData}
              setFormData={setFormData}
              selectedProductId={selectedProductId}
              products={products}
              loading={loading}
              saving={saving}
              editingDistribution={editingDistribution}
              onProductSelect={handleProductSelect}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              formatPrice={formatPrice}
              getTomorrowDate={getTomorrowDate}
              getTodayDate={getTodayDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
