"use client";

import React, { useEffect, useState } from 'react';
import { membershipService } from '@/lib/membershipService';
import { MembershipUpgradeRequest } from '@/types/membership';
import toast from 'react-hot-toast';

export default function MembershipUpgradePage() {
  const [requests, setRequests] = useState<MembershipUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    requested_tier: '',
    reason: '',
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await membershipService.getUpgradeRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error loading upgrade requests:', error);
      toast.error('Lỗi khi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requested_tier) {
      toast.error('Vui lòng chọn gói muốn nâng cấp');
      return;
    }

    try {
      setCreating(true);
      const response = await membershipService.createUpgradeRequest({
        requested_tier: formData.requested_tier as any,
        reason: formData.reason,
      });

      if (response.success) {
        toast.success(response.message);
        setShowCreateForm(false);
        setFormData({ requested_tier: '', reason: '' });
        loadRequests();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error creating upgrade request:', error);
      toast.error('Lỗi khi tạo yêu cầu nâng cấp');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      'approved': { text: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      'rejected': { text: 'Đã từ chối', class: 'bg-red-100 text-red-800' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getTierName = (tier: string) => {
    const tierMap = {
      'basic': 'Cơ bản',
      'silver': 'Bạc',
      'gold': 'Vàng',
      'platinum': 'Bạch kim',
      'diamond': 'Kim cương'
    };
    return tierMap[tier as keyof typeof tierMap] || tier;
  };

  const hasPendingRequest = requests.some(req => req.status === 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nâng cấp gói thành viên</h1>
          <p className="text-gray-600 mt-1">Quản lý yêu cầu nâng cấp gói thành viên của bạn</p>
        </div>
        {!hasPendingRequest && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Tạo yêu cầu nâng cấp
          </button>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo yêu cầu nâng cấp gói</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="requested_tier" className="block text-sm font-medium text-gray-700 mb-2">
                  Gói muốn nâng cấp
                </label>
                <select
                  id="requested_tier"
                  value={formData.requested_tier}
                  onChange={(e) => setFormData({ ...formData, requested_tier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn gói</option>
                  <option value="silver">Gói Bạc</option>
                  <option value="gold">Gói Vàng</option>
                  <option value="platinum">Gói Bạch kim</option>
                  <option value="diamond">Gói Kim cương</option>
                </select>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do nâng cấp (tùy chọn)
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập lý do bạn muốn nâng cấp gói..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ requested_tier: '', reason: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {creating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang tạo...
                    </div>
                  ) : (
                    'Tạo yêu cầu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lịch sử yêu cầu nâng cấp</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Chưa có yêu cầu nâng cấp nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Nâng cấp lên {getTierName(request.requested_tier)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Từ {getTierName(request.current_tier)} lên {getTierName(request.requested_tier)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.reason && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Lý do:</span> {request.reason}
                    </p>
                  </div>
                )}

                {request.admin_note && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ghi chú từ admin:</span> {request.admin_note}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Tạo lúc: {request.created_at}</span>
                  {request.reviewed_at && (
                    <span>Duyệt lúc: {request.reviewed_at}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Membership Tiers Information */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin các gói thành viên</h2>
          <p className="text-sm text-gray-600 mt-1">Chi tiết về các gói thành viên và quyền lợi</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Tier */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gói Cơ bản</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Miễn phí
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tạo đơn hàng cơ bản
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hỗ trợ chat cơ bản
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Giới hạn 10 đơn/tháng
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hoa hồng cơ bản 2%
                </li>
              </ul>
            </div>

            {/* Silver Tier */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gói Bạc</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  Nâng cấp có phí
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tất cả quyền lợi gói Cơ bản
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Giới hạn 50 đơn/tháng
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hoa hồng nâng cao 3%
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hỗ trợ ưu tiên
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Báo cáo chi tiết
                </li>
              </ul>
            </div>

            {/* Gold Tier */}
            <div className="border border-yellow-300 rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gói Vàng</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
                  Phổ biến
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tất cả quyền lợi gói Bạc
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Giới hạn 200 đơn/tháng
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hoa hồng cao 5%
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Công cụ phân tích nâng cao
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API truy cập
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hỗ trợ 24/7
                </li>
              </ul>
            </div>

            {/* Platinum Tier */}
            <div className="border border-purple-300 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gói Bạch kim</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-200 text-purple-800">
                  Doanh nghiệp
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tất cả quyền lợi gói Vàng
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Giới hạn 1000 đơn/tháng
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hoa hồng đặc biệt 7%
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Quản lý nhiều tài khoản
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tích hợp webhook
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Account manager riêng
                </li>
              </ul>
            </div>

            {/* Diamond Tier */}
            <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gói Kim cương</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-800">
                  Cao cấp nhất
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tất cả quyền lợi gói Bạch kim
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Không giới hạn đơn hàng
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hoa hồng tối đa 10%
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tính năng beta độc quyền
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tùy chỉnh theo yêu cầu
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đào tạo và tư vấn 1:1
                </li>
              </ul>
            </div>

            {/* Enterprise Note */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Gói Doanh nghiệp</h3>
                <p className="text-gray-300 mb-4">
                  Bạn cần giải pháp tùy chỉnh cho doanh nghiệp lớn? Chúng tôi có thể thiết kế gói đặc biệt phù hợp với nhu cầu của bạn.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Giá cả linh hoạt
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tích hợp hệ thống riêng
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Hỗ trợ on-site
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
