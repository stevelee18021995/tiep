"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import { membershipService } from '@/lib/membershipService';
import { MembershipUpgradeRequest } from '@/types/membership';
import toast from 'react-hot-toast';

export default function AdminMembershipUpgradesPage() {
  const [requests, setRequests] = useState<MembershipUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MembershipUpgradeRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await membershipService.getUpgradeRequests(params);
      setRequests(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Error loading upgrade requests:', error);
      toast.error('Lỗi khi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, itemsPerPage]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingRequestId(selectedRequest.id);
      const response = await membershipService.approveUpgradeRequest(selectedRequest.id, adminNote);

      if (response.success) {
        toast.success(response.message);
        setShowApproveModal(false);
        setAdminNote('');
        setSelectedRequest(null);
        loadRequests();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Lỗi khi duyệt yêu cầu');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessingRequestId(selectedRequest.id);
      const response = await membershipService.rejectUpgradeRequest(selectedRequest.id, adminNote);

      if (response.success) {
        toast.success(response.message);
        setShowRejectModal(false);
        setAdminNote('');
        setSelectedRequest(null);
        loadRequests();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Lỗi khi từ chối yêu cầu');
    } finally {
      setProcessingRequestId(null);
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

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Duyệt yêu cầu nâng cấp gói</h1>
            <p className="text-gray-600 mt-1">Quản lý và duyệt các yêu cầu nâng cấp gói thành viên</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Status Filter */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc theo trạng thái
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Tất cả', class: 'bg-gray-100 text-gray-800' },
                    { key: 'pending', label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
                    { key: 'approved', label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
                    { key: 'rejected', label: 'Đã từ chối', class: 'bg-red-100 text-red-800' }
                  ].map((status) => (
                    <button
                      key={status.key}
                      onClick={() => setStatusFilter(status.key)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${statusFilter === status.key
                        ? `${status.class} ring-2 ring-offset-1 ring-blue-500`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items per page */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hiển thị:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">mục</span>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Danh sách yêu cầu nâng cấp</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Đang tải...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Không có yêu cầu nâng cấp nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.user?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.user?.email}
                            </p>
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">
                                Nâng cấp từ {getTierName(request.current_tier)} lên {getTierName(request.requested_tier)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(request.status)}
                          </div>
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
                              <span className="font-medium">Ghi chú:</span> {request.admin_note}
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

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              disabled={processingRequestId === request.id}
                              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px]"
                            >
                              {processingRequestId === request.id ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span className="hidden sm:inline">Đang xử lý...</span>
                                </div>
                              ) : (
                                'Duyệt'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              disabled={processingRequestId === request.id}
                              className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px]"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <div className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium min-w-[100px]">
                            Đã duyệt
                          </div>
                        )}
                        {request.status === 'rejected' && (
                          <div className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium min-w-[100px]">
                            Đã từ chối
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}
                    trong tổng số {totalItems} yêu cầu
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Approve Modal */}
          {showApproveModal && selectedRequest && (
            <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Duyệt yêu cầu nâng cấp</h2>

                <div className="mb-4">
                  <p className="text-gray-600">
                    Bạn có chắc chắn muốn duyệt yêu cầu nâng cấp lên gói <strong>{getTierName(selectedRequest.requested_tier)}</strong>
                    của <strong>{selectedRequest.user?.name}</strong>?
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="approve_note" className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    id="approve_note"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Nhập ghi chú..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveModal(false);
                      setAdminNote('');
                      setSelectedRequest(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processingRequestId === selectedRequest.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {processingRequestId === selectedRequest.id ? 'Đang duyệt...' : 'Duyệt'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && selectedRequest && (
            <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Từ chối yêu cầu nâng cấp</h2>

                <div className="mb-4">
                  <p className="text-gray-600">
                    Bạn có chắc chắn muốn từ chối yêu cầu nâng cấp lên gói <strong>{getTierName(selectedRequest.requested_tier)}</strong>
                    của <strong>{selectedRequest.user?.name}</strong>?
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="reject_note" className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reject_note"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Nhập lý do từ chối..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setAdminNote('');
                      setSelectedRequest(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processingRequestId === selectedRequest.id || !adminNote.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {processingRequestId === selectedRequest.id ? 'Đang từ chối...' : 'Từ chối'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
