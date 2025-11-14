import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { User } from '@/types';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export default function AddMoneyModal({
  isOpen,
  onClose,
  user,
  onSuccess
}: AddMoneyModalProps) {
  console.log('AddMoneyModal render:', { isOpen, user });

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (numAmount > 1000000) {
      toast.error('Số tiền không được vượt quá €1,000,000');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}/add-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          description: description || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Đã cộng €${numAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} vào tài khoản ${user.name}!`);
        setAmount('');
        setDescription('');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Có lỗi xảy ra khi cộng tiền');
      }
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('Có lỗi xảy ra khi cộng tiền');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cộng tiền vào tài khoản</h2>
              <p className="text-sm text-gray-600">{user.name} ({user.email})</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Balance Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Số dư hiện tại</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              €{(user.balance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền cộng thêm (EUR) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max="1000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu: €0.01 - Tối đa: €1,000,000
            </p>
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Lý do cộng tiền (ví dụ: Bonus, bù trừ, khuyến mãi...)"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 ký tự
            </div>
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Xác nhận thao tác</span>
              </div>
              <div className="text-sm text-green-700">
                Cộng <strong>€{parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong> vào tài khoản
              </div>
              <div className="text-sm text-green-700">
                Số dư sau cộng: <strong>€{((user.balance || 0) + parseFloat(amount)).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-2 text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang xử lý...' : 'Cộng tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
