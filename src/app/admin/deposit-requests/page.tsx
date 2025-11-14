'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import AuthGuard from '@/components/AuthGuard'
import { formatCurrency } from '@/lib/utils'
import { DepositRequest, DepositRequestStatistics } from '@/types/deposit'
import { toast } from 'react-hot-toast'
import { FiEye, FiCheck, FiX, FiRefreshCw, FiDollarSign, FiTrendingUp, FiClock, FiUsers } from 'react-icons/fi'

export default function AdminDepositRequestsPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([])
  const [statistics, setStatistics] = useState<DepositRequestStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [adminNote, setAdminNote] = useState('')

  const paymentMethodNames = {
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    zalopay: 'Ví ZaloPay',
    vietqr: 'VietQR'
  }

  const typeNames = {
    deposit: 'Nạp tiền',
    withdraw: 'Rút tiền'
  }

  const typeColors = {
    deposit: 'bg-blue-100 text-blue-800',
    withdraw: 'bg-orange-100 text-orange-800'
  }

  const statusNames = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString()
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/deposit-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setRequests(data.data.data)
        setTotalPages(data.data.last_page)
      } else {
        toast.error(data.message || 'Không thể tải danh sách yêu cầu')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/deposit-requests/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const viewRequest = async (request: DepositRequest) => {
    setSelectedRequest(request)
    setAdminNote('')
    setShowDetailModal(true)
  }

  const approveRequest = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading('approve')
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/deposit-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_note: adminNote })
      })

      const data = await response.json()

      if (data.success) {
        const action = selectedRequest.type === 'deposit' ? 'nạp tiền' : 'rút tiền'
        toast.success(`Duyệt yêu cầu ${action} thành công!`)
        setShowDetailModal(false)
        fetchRequests()
        fetchStatistics()
      } else {
        toast.error(data.message || 'Không thể duyệt yêu cầu')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Có lỗi xảy ra khi duyệt yêu cầu')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectRequest = async () => {
    if (!selectedRequest || !adminNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      setActionLoading('reject')
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/deposit-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_note: adminNote })
      })

      const data = await response.json()

      if (data.success) {
        const action = selectedRequest.type === 'deposit' ? 'nạp tiền' : 'rút tiền'
        toast.success(`Từ chối yêu cầu ${action} thành công!`)
        setShowDetailModal(false)
        fetchRequests()
        fetchStatistics()
      } else {
        toast.error(data.message || 'Không thể từ chối yêu cầu')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchStatistics()
  }, [currentPage, perPage, statusFilter, typeFilter, searchTerm])

  return (
    <AuthGuard requireAdmin>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý nạp rút tiền</h1>
            <button
              onClick={() => {
                fetchRequests()
                fetchStatistics()
              }}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Deposit Stats */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiDollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Nạp tiền</h3>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tổng:</span>
                    <span className="text-sm font-medium">{statistics.deposits.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Chờ duyệt:</span>
                    <span className="text-sm font-medium text-yellow-600">{statistics.deposits.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Đã duyệt:</span>
                    <span className="text-sm font-medium text-green-600">{statistics.deposits.approved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Số tiền:</span>
                    <span className="text-sm font-medium text-blue-600">{formatCurrency(statistics.deposits.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Withdraw Stats */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FiTrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Rút tiền</h3>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tổng:</span>
                    <span className="text-sm font-medium">{statistics.withdraws.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Chờ duyệt:</span>
                    <span className="text-sm font-medium text-yellow-600">{statistics.withdraws.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Đã duyệt:</span>
                    <span className="text-sm font-medium text-green-600">{statistics.withdraws.approved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Số tiền:</span>
                    <span className="text-sm font-medium text-orange-600">{formatCurrency(statistics.withdraws.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiClock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Chờ duyệt</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.pending}</p>
                    <p className="text-xs text-gray-500">
                      Nạp: {statistics.deposits.pending} | Rút: {statistics.withdraws.pending}
                    </p>
                  </div>
                </div>
              </div>

              {/* Today Stats */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Hôm nay</p>
                    <p className="text-lg font-bold text-gray-900">{statistics.today_requests} yêu cầu</p>
                    <p className="text-xs text-gray-500">
                      Nạp: {statistics.deposits.today_requests} | Rút: {statistics.withdraws.today_requests}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-64"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="deposit">Nạp tiền</option>
              <option value="withdraw">Rút tiền</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 / trang</option>
              <option value={15}>15 / trang</option>
              <option value={25}>25 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Đang tải...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy yêu cầu nào</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">#{request.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[request.type]}`}>
                            {typeNames[request.type]}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                            {statusNames[request.status]}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Người dùng:</p>
                            <p className="font-medium">{request.user?.name}</p>
                            <p className="text-sm text-gray-500">{request.user?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Số tiền:</p>
                            <p className={`text-xl font-bold ${request.type === 'deposit' ? 'text-blue-600' : 'text-orange-600'}`}>
                              {request.type === 'withdraw' ? '-' : '+'}{formatCurrency(request.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              {request.type === 'deposit' ? 'Phương thức nạp:' : 'Thông tin tài khoản:'}
                            </p>
                            {request.type === 'deposit' ? (
                              <p className="font-medium">{paymentMethodNames[request.payment_method!]}</p>
                            ) : (
                              <div className="text-sm">
                                <p className="font-medium">{request.bank_name}</p>
                                <p className="text-gray-600">{request.account_holder_name}</p>
                                <p className="text-gray-600">{request.account_number}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {new Date(request.created_at).toLocaleString('vi-VN')}
                        </p>
                        {request.note && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Ghi chú:</span> {request.note}
                          </p>
                        )}
                        {request.admin_note && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Ghi chú admin:</span> {request.admin_note}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => viewRequest(request)}
                          className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => viewRequest(request)}
                              className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <FiCheck className="w-4 h-4" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => viewRequest(request)}
                              className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FiX className="w-4 h-4" />
                              <span>Từ chối</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                Trước
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                Sau
              </button>
            </div>
          )}

          {/* Detail/Action Modal */}
          {showDetailModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-[3px] flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">
                  {selectedRequest.status === 'pending' ? 'Xử lý yêu cầu' : 'Chi tiết yêu cầu'} #{selectedRequest.id}
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Loại:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${typeColors[selectedRequest.type]}`}>
                        {typeNames[selectedRequest.type]}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedRequest.status]}`}>
                        {statusNames[selectedRequest.status]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Số tiền:</span>
                    <span className={`ml-2 font-semibold text-lg ${selectedRequest.type === 'deposit' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {selectedRequest.type === 'withdraw' ? '-' : '+'}{formatCurrency(selectedRequest.amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Người dùng:</span>
                    <div className="mt-1">
                      <p className="font-medium">{selectedRequest.user?.name}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.user?.email}</p>
                    </div>
                  </div>

                  {selectedRequest.type === 'deposit' ? (
                    <div>
                      <span className="text-sm text-gray-500">Phương thức nạp:</span>
                      <span className="ml-2">{paymentMethodNames[selectedRequest.payment_method!]}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm text-gray-500">Thông tin tài khoản rút tiền:</span>
                      <div className="mt-1 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{selectedRequest.bank_name}</p>
                        <p className="text-sm text-gray-600">Chủ tài khoản: {selectedRequest.account_holder_name}</p>
                        <p className="text-sm text-gray-600">Số tài khoản: {selectedRequest.account_number}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-gray-500">Thời gian tạo:</span>
                    <span className="ml-2">{new Date(selectedRequest.created_at).toLocaleString('vi-VN')}</span>
                  </div>

                  {selectedRequest.note && (
                    <div>
                      <span className="text-sm text-gray-500">Ghi chú:</span>
                      <p className="mt-1 text-gray-700">{selectedRequest.note}</p>
                    </div>
                  )}

                  {selectedRequest.admin_note && (
                    <div>
                      <span className="text-sm text-gray-500">Ghi chú admin:</span>
                      <p className="mt-1 text-gray-700">{selectedRequest.admin_note}</p>
                    </div>
                  )}

                  {selectedRequest.approved_at && (
                    <div>
                      <span className="text-sm text-gray-500">Thời gian duyệt:</span>
                      <span className="ml-2">{new Date(selectedRequest.approved_at).toLocaleString('vi-VN')}</span>
                    </div>
                  )}

                  {selectedRequest.status === 'pending' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú admin {selectedRequest.status === 'pending' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder={selectedRequest.status === 'pending' ? `Ghi chú cho yêu cầu ${typeNames[selectedRequest.type].toLowerCase()} (bắt buộc khi từ chối)` : 'Ghi chú thêm (không bắt buộc)'}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={actionLoading !== null}
                  >
                    {selectedRequest.status === 'pending' ? 'Hủy' : 'Đóng'}
                  </button>

                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={rejectRequest}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'reject' ? 'Đang từ chối...' : 'Từ chối'}
                      </button>
                      <button
                        onClick={approveRequest}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'approve' ? 'Đang duyệt...' : 'Duyệt'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
