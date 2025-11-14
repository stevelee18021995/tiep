"use client";

import './success-effects.css';
import { useState, useEffect } from 'react';
import { useOrders, useOrderStatistics } from '@/hooks/useOrders';
import { orderService } from '@/lib/orderService';
import { useSuccessEffects } from '@/hooks/useSuccessEffects';
import { handleApiError, isInsufficientBalanceError, isDailyLimitError } from '@/lib/errorHandler';
import toast from 'react-hot-toast';
import {
  Package,
  CheckCircle,
  TrendingUp,
  Calendar,
  Plus,
  Clock,
  XCircle,
  AlertTriangle,
  Award,
  Wallet
} from 'lucide-react';

export default function OrdersPage() {
  const { orders, loading, fetchOrders, completeOrder } = useOrders();
  const { userStatistics, fetchUserStatistics } = useOrderStatistics();
  const { playSuccessEffects } = useSuccessEffects();
  const [filter, setFilter] = useState<string>('all');
  const [completing, setCompleting] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchOrders({ status: filter === 'all' ? undefined : filter });
  }, [filter, fetchOrders]);

  useEffect(() => {
    fetchUserStatistics();
  }, [fetchUserStatistics]);

  const handleCompleteOrder = async (orderId: number) => {
    try {
      setCompleting(orderId);
      const response = await completeOrder(orderId);

      // Play success effects with profit amount
      playSuccessEffects(
        'Đơn hàng hoàn thành thành công!',
        response.profit_earned
      );

      // Refresh statistics
      fetchUserStatistics();
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Có lỗi xảy ra khi hoàn thành đơn hàng!');
    } finally {
      setCompleting(null);
    }
  };

  const handleCreateFromProduct = async () => {
    try {
      setCreating(true);
      const response = await orderService.createFromProduct();
      const profitAmount = response.data?.order?.profit_amount || 0;
      if (response.success) {
        // Play success effects with order details
        playSuccessEffects(
          'Đã nhận đơn hàng mới thành công!',
          profitAmount
        );

        // Show success message with additional info
        toast.success(
          response.message +
          (response.data?.new_balance !== undefined && response.data.new_balance !== null ?
            ` Số dư mới: €${Number(response.data.new_balance).toFixed(2)}` : '')
        );

        // Refresh data
        fetchOrders({ status: filter === 'all' ? undefined : filter });
        fetchUserStatistics();
      } else {
        toast.error(`${response.message}`);
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Có lỗi xảy ra khi tạo đơn hàng!');

      // Show different toast styles based on error type
      if (isInsufficientBalanceError(error)) {
        toast.error(errorMessage, {
          duration: 6000,
          icon: '💰'
        });
      } else if (isDailyLimitError(error)) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '⏰'
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_distribution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_distribution': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMembershipTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'text-gray-600 bg-gray-100';
      case 'silver': return 'text-gray-500 bg-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'diamond': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMembershipTierText = (tier: string) => {
    switch (tier) {
      case 'basic': return 'Cơ bản';
      case 'silver': return 'Bạc';
      case 'gold': return 'Vàng';
      case 'platinum': return 'Bạch kim';
      case 'diamond': return 'Kim cương';
      default: return 'Cơ bản';
    }
  };

  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      {/* Compact Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Đơn Hàng Của Tôi</h1>
              <p className="text-blue-100 text-sm">
                {userStatistics && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getMembershipTierColor(userStatistics.membership_tier)}`}>
                    <Award className="h-3 w-3 inline mr-1" />
                    {getMembershipTierText(userStatistics.membership_tier)} - {userStatistics.commission_rate}%
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleCreateFromProduct}
              disabled={creating || (userStatistics?.remaining_today === 0)}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm border border-white/20 text-sm w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              {creating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="hidden sm:inline">Đang tạo...</span>
                  <span className="sm:hidden">Tạo...</span>
                </div>
              ) : (
                <div>
                  <div>Nhận đơn mới</div>
                  {userStatistics?.remaining_today !== undefined && (
                    <div className="text-xs text-blue-100">
                      {userStatistics.remaining_today} còn lại
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Compact Statistics Cards */}
      {userStatistics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Today Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">HÔM NAY</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {userStatistics.today_orders}
              </p>
              <p className="text-xs text-gray-600">
                Giới hạn: {userStatistics.daily_limit}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                Còn lại: {userStatistics.remaining_today}
              </p>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">CHỜ XỬ LÝ</span>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">
                {userStatistics.total_pending}
              </p>
              <p className="text-xs text-gray-600">Đơn chờ hoàn thành</p>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">HOÀN THÀNH</span>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {userStatistics.total_completed}
              </p>
              <p className="text-xs text-gray-600">Đơn thành công</p>
            </div>
          </div>

          {/* Failed/Rejected Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">THẤT BẠI</span>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">
                {(userStatistics.total_failed || 0) + (userStatistics.total_rejected || 0)}
              </p>
              <p className="text-xs text-gray-600">
                TBại: {userStatistics.total_failed || 0} | Từ chối: {userStatistics.total_rejected || 0}
              </p>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">TỔNG KIẾM</span>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">
                {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(userStatistics.total_earnings)}
              </p>
              <p className="text-xs text-gray-600">Tổng thu nhập</p>
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">SỐ DƯ</span>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(userStatistics.current_balance)}
              </p>
              <p className="text-xs text-gray-600">Số dư hiện tại</p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả', count: userStatistics?.total_all_orders || 0, icon: Package, color: 'text-gray-600' },
              { key: 'pending_distribution', label: 'Chờ xử lý', count: userStatistics?.total_pending || 0, icon: Clock, color: 'text-yellow-600' },
              { key: 'completed', label: 'Hoàn thành', count: userStatistics?.total_completed || 0, icon: CheckCircle, color: 'text-green-600' },
              { key: 'failed', label: 'Thất bại', count: userStatistics?.total_failed || 0, icon: XCircle, color: 'text-red-600' },
              { key: 'rejected', label: 'Từ chối', count: userStatistics?.total_rejected || 0, icon: AlertTriangle, color: 'text-orange-600' }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`${filter === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    } whitespace-nowrap py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all duration-200`}
                >
                  <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${filter === tab.key ? 'text-blue-600' : tab.color}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className={`${filter === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    } inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium min-w-[20px] justify-center`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Orders List */}
        <div className="p-3 sm:p-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'Chưa có đơn hàng' : `Không có đơn hàng ${filter === 'pending_distribution' ? 'chờ xử lý' :
                  filter === 'completed' ? 'hoàn thành' :
                    filter === 'failed' ? 'thất bại' :
                      filter === 'rejected' ? 'bị từ chối' : 'đã hủy'
                  }`}
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                {filter === 'all'
                  ? 'Đơn hàng sẽ được phân phối tự động cho bạn.'
                  : 'Thử chọn bộ lọc khác để xem các đơn hàng khác.'
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={handleCreateFromProduct}
                  disabled={creating || (userStatistics?.remaining_today === 0)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors text-sm"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Nhận đơn hàng đầu tiên
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 lg:p-4 hover:bg-gray-100 transition-colors border border-gray-200 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Compact Product Image or Letter Avatar */}
                        {order.product?.image_url ? (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={order.product.image_url}
                              alt={order.product.name || order.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const letterDiv = target.nextElementSibling as HTMLDivElement;
                                if (letterDiv) {
                                  letterDiv.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ display: 'none' }}>
                              {order.title.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {order.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate flex-1 min-w-0">
                              {order.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex-shrink-0 self-start sm:self-auto`}>
                              {getStatusIcon(order.status)}
                              <span className="truncate">{order.status_text}</span>
                            </span>
                          </div>
                          {order.description && (
                            <div className="text-gray-600 text-xs sm:text-sm break-words">
                              <p className="overflow-hidden"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  maxHeight: '2.5rem'
                                }}>
                                {order.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
                        <div className="bg-white rounded-md p-2">
                          <p className="text-xs text-gray-500 font-medium mb-0.5">GIÁ TRỊ</p>
                          <p className="font-bold text-gray-900 text-sm">
                            {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(order.total_value)}
                          </p>
                        </div>
                        <div className="bg-white rounded-md p-2">
                          <p className="text-xs text-gray-500 font-medium mb-0.5">LỢI NHUẬN</p>
                          <p className="font-bold text-green-600 text-sm">
                            {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(order.profit_amount)}
                          </p>
                          {order.commission_rate && (
                            <p className="text-xs text-gray-500">({order.commission_rate}%)</p>
                          )}
                        </div>
                        <div className="bg-white rounded-md p-2">
                          <p className="text-xs text-gray-500 font-medium mb-0.5">NGÀY TẠO</p>
                          <p className="font-semibold text-gray-900 text-xs">
                            {new Date(order.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="bg-white rounded-md p-2">
                          <p className="text-xs text-gray-500 font-medium mb-0.5">HOÀN THÀNH</p>
                          <p className="font-semibold text-gray-900 text-xs">
                            {order.completed_at ? new Date(order.completed_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit'
                            }) : '-'}
                          </p>
                          {order.completed_at && (
                            <p className="text-xs text-gray-500">
                              {new Date(order.completed_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        {order.membership_tier && (
                          <div className="bg-white rounded-md p-2 col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-500 font-medium mb-0.5">GÓI THÀNH VIÊN</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${getMembershipTierColor(order.membership_tier)}`}>
                              <Award className="h-3 w-3" />
                              {getMembershipTierText(order.membership_tier)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {order.can_complete && (
                      <div className="ml-3 sm:ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          disabled={completing === order.id}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold flex items-center gap-2 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm"
                        >
                          {completing === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span className="hidden sm:inline">Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <div className="hidden sm:block">
                                <div>Hoàn thành</div>
                                <div className="text-xs text-green-100">
                                  +{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(order.profit_amount)}
                                </div>
                              </div>
                              <span className="sm:hidden">Hoàn thành</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Creation Loading Modal */}
      {creating && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 max-w-sm w-full mx-4 text-center">
            <div className="mb-6">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tạo đơn hàng</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Xin vui lòng chờ đợi hệ thống phân phối đơn
              </p>
            </div>
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
