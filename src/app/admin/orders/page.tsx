"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import { orderService } from '@/lib/orderService';
import { Order, OrdersResponse } from '@/types/order';
import toast from 'react-hot-toast';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [distributingOrderId, setDistributingOrderId] = useState<number | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statistics, setStatistics] = useState({
    total_pending: 0,
    total_completed: 0,
    total_failed: 0,
    total_rejected: 0,
    total_all: 0
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage
      };

      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Add search term if provided
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response: OrdersResponse = await orderService.getOrders(params);

      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, itemsPerPage]);

  const loadStatistics = useCallback(async () => {
    try {
      // Load statistics for all statuses
      const allStats = await Promise.all([
        orderService.getOrders({ status: 'pending_distribution', per_page: 1 }),
        orderService.getOrders({ status: 'completed', per_page: 1 }),
        orderService.getOrders({ status: 'failed', per_page: 1 }),
        orderService.getOrders({ status: 'rejected', per_page: 1 }),
        orderService.getOrders({ per_page: 1 }) // All orders
      ]);

      setStatistics({
        total_pending: allStats[0].data.total,
        total_completed: allStats[1].data.total,
        total_failed: allStats[2].data.total,
        total_rejected: allStats[3].data.total,
        total_all: allStats[4].data.total
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  // Load orders and statistics
  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [loadOrders, loadStatistics]);

  // Reset page when search term or status filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };


  // Auto-complete all pending orders
  const handleDistribute = async () => {
    try {
      setDistributing(true);
      const result = await orderService.autoCompleteAllOrders();

      if (result.success) {
        toast.success(`✅ ${result.message}`);
        if (result.completed_count && result.completed_count > 0) {
          toast.success(`🎉 Đã hoàn thành ${result.completed_count} đơn hàng!`);
        }
        if (result.failed_count && result.failed_count > 0) {
          toast.error(`⚠️ ${result.failed_count} đơn hàng thất bại`);
        }
        loadOrders(); // Reload data
        loadStatistics(); // Reload statistics
      } else {
        toast.error(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error('Error auto-completing orders:', error);
      toast.error('Lỗi khi hoàn thành tự động đơn hàng');
    } finally {
      setDistributing(false);
    }
  };

  // Distribute specific order
  const handleDistributeOrder = async (orderId: number) => {
    try {
      setDistributingOrderId(orderId);
      const response = await orderService.distributeSpecificOrder(orderId);

      if (response.success) {
        toast.success(`✅ ${response.message}`);
        loadOrders(); // Reload data
        loadStatistics(); // Reload statistics
      } else {
        toast.error(`Lỗi: ${response.message}`);
      }
    } catch (error) {
      console.error('Error distributing order:', error);
      toast.error('Lỗi khi phân phối đơn hàng');
    } finally {
      setDistributingOrderId(null);
    }
  };

  // Cancel specific order
  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      const response = await orderService.cancelOrder(orderId);

      if (response.success) {
        toast.success(`✅ ${response.message}`);
        loadOrders(); // Reload data
        loadStatistics(); // Reload statistics
      } else {
        toast.error(`Lỗi: ${response.message}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Lỗi khi hủy đơn hàng');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Delete specific order
  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng này? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      const response = await orderService.deleteOrder(orderId);

      if (response.success) {
        toast.success(`✅ ${response.message}`);
        loadOrders(); // Reload data
        loadStatistics(); // Reload statistics
      } else {
        toast.error(`Lỗi: ${response.message}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Lỗi khi xóa đơn hàng');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending_distribution': { text: 'Chờ phân phối', class: 'bg-yellow-100 text-yellow-800' },
      'completed': { text: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
      'failed': { text: 'Thất bại', class: 'bg-red-100 text-red-800' },
      'rejected': { text: 'Từ chối', class: 'bg-orange-100 text-orange-800' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-600 mt-1">Phân phối và quản lý các đơn hàng trong hệ thống</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="h-8 w-8 text-gray-600" />
                <span className="text-xs text-gray-500 font-medium">TỔNG</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_all}</p>
                <p className="text-sm text-gray-600">Tất cả đơn hàng</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <span className="text-xs text-gray-500 font-medium">CHỜ</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{statistics.total_pending}</p>
                <p className="text-sm text-gray-600">Chờ phân phối</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <span className="text-xs text-gray-500 font-medium">HOÀN THÀNH</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{statistics.total_completed}</p>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
                <span className="text-xs text-gray-500 font-medium">THẤT BẠI</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{statistics.total_failed}</p>
                <p className="text-sm text-gray-600">Thất bại</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <span className="text-xs text-gray-500 font-medium">TỪ CHỐI</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{statistics.total_rejected}</p>
                <p className="text-sm text-gray-600">Bị từ chối</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm đơn hàng
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Nhập tiêu đề hoặc mô tả đơn hàng..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc theo trạng thái
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Tất cả', class: 'bg-gray-100 text-gray-800', count: statistics.total_all },
                    { key: 'pending_distribution', label: 'Chờ phân phối', class: 'bg-yellow-100 text-yellow-800', count: statistics.total_pending },
                    { key: 'completed', label: 'Hoàn thành', class: 'bg-green-100 text-green-800', count: statistics.total_completed },
                    { key: 'failed', label: 'Thất bại', class: 'bg-red-100 text-red-800', count: statistics.total_failed },
                    { key: 'rejected', label: 'Từ chối', class: 'bg-orange-100 text-orange-800', count: statistics.total_rejected }
                  ].map((status) => (
                    <button
                      key={status.key}
                      onClick={() => handleStatusFilterChange(status.key)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-2 ${statusFilter === status.key
                        ? `${status.class} ring-2 ring-offset-1 ring-blue-500`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <span>{status.label}</span>
                      <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-xs">
                        {status.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleDistribute}
                  disabled={distributing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {distributing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang hoàn thành tự động...
                    </div>
                  ) : (
                    'Hoàn thành tự động tất cả'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Danh sách đơn hàng</h2>
                {(searchTerm || statusFilter !== 'all') && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Đang lọc:</span>
                    {searchTerm && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        "{searchTerm}"
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {statusFilter === 'pending_distribution' ? 'Chờ phân phối' :
                          statusFilter === 'completed' ? 'Hoàn thành' :
                            statusFilter === 'failed' ? 'Thất bại' :
                              statusFilter === 'rejected' ? 'Từ chối' : 'Đã hủy'}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Đang tải...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Không có đơn hàng nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              {/* Product Image */}
                              {order.product?.image_url && (
                                <img
                                  src={order.product.image_url}
                                  alt={order.product.name}
                                  className="w-16 h-16 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {order.title}
                                </h3>
                                {order.product && (
                                  <p className="text-xs text-blue-600 font-medium">
                                    Sản phẩm: {order.product.name} (ID: {order.product.id})
                                  </p>
                                )}
                                {order.description && (
                                  <p className="text-sm text-gray-600 mt-1 max-w-md overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {order.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="flex-shrink-0">
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-gray-500 font-medium">Giá trị đơn hàng</p>
                            <p className="text-gray-900 font-semibold">
                              {Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(order.total_value)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 font-medium">Người phân phối</p>
                            <div className="text-gray-900">
                              {order.assigned_user ? (
                                <div>
                                  <div className="font-medium">{order.assigned_user.name}</div>
                                  <div className="text-gray-500 text-xs">ID: {order.assigned_user.id}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Chưa phân phối</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 font-medium">Ngày tạo</p>
                            <p className="text-gray-900">{order.created_at}</p>
                          </div>

                          <div>
                            <p className="text-gray-500 font-medium">Ngày phân phối</p>
                            <p className="text-gray-900">
                              {order.distributed_at || <span className="text-gray-400 italic">Chưa phân phối</span>}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                        {order.status === 'pending_distribution' && (
                          <>
                            <button
                              onClick={() => handleDistributeOrder(order.id)}
                              disabled={distributingOrderId === order.id}
                              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px]"
                            >
                              {distributingOrderId === order.id ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span className="hidden sm:inline">Đang xử lý...</span>
                                </div>
                              ) : (
                                'Hoàn thành'
                              )}
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px]"
                            >
                              {cancellingOrderId === order.id ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span className="hidden sm:inline">Đang hủy...</span>
                                </div>
                              ) : (
                                'Hủy'
                              )}
                            </button>
                          </>
                        )}

                        {/* Delete button - available for all statuses */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          className="flex-1 lg:flex-none bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] flex items-center justify-center gap-2"
                        >
                          {deletingOrderId === order.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span className="hidden sm:inline">Đang xóa...</span>
                            </div>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Xóa</span>
                            </>
                          )}
                        </button>

                        {order.status === 'completed' && (
                          <div className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium min-w-[100px]">
                            Hoàn thành
                          </div>
                        )}
                        {order.status === 'failed' && (
                          <div className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium min-w-[100px]">
                            Thất bại
                          </div>
                        )}
                        {order.status === 'rejected' && (
                          <div className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium min-w-[100px]">
                            Từ chối
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
                {/* Pagination Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-700">
                      Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}
                      trong tổng số {totalItems} đơn hàng
                    </div>

                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Hiển thị:</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1">
                    {/* First page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Trang đầu"
                    >
                      ««
                    </button>

                    {/* Previous page */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border-t border-b border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Trang trước"
                    >
                      ‹
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page, index) => (
                      <React.Fragment key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-sm border-t border-b border-gray-300 bg-white text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-3 py-2 text-sm border-t border-b border-gray-300 ${currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                              }`}
                          >
                            {page}
                          </button>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Next page */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border-t border-b border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Trang sau"
                    >
                      ›
                    </button>

                    {/* Last page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Trang cuối"
                    >
                      »»
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
