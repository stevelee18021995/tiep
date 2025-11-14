"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useOrderStatistics } from '@/hooks/useOrders';
import {
  TrendingUp,
  Users,
  Activity,
  ChevronRight,
  Calendar,
  CheckCircle,
  DollarSign,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function MemberDashboard() {
  const { user } = useAuth();
  const { userStatistics, fetchUserStatistics } = useOrderStatistics();

  useEffect(() => {
    fetchUserStatistics();
  }, [fetchUserStatistics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Chào mừng, {user?.name}!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Quản lý tài khoản và theo dõi hoạt động của bạn
              </p>
            </div>
          </div>
          {userStatistics && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMembershipTierColor(userStatistics.membership_tier)}`}>
              {getMembershipTierText(userStatistics.membership_tier)}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Current Balance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Số dư hiện tại</p>
              <p className="text-xl font-bold text-green-600">
                {userStatistics ? formatCurrency(userStatistics.current_balance) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng thu nhập</p>
              <p className="text-xl font-bold text-purple-600">
                {userStatistics ? formatCurrency(userStatistics.total_earnings) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Today Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đơn hôm nay</p>
              <p className="text-xl font-bold text-blue-600">
                {userStatistics ? `${userStatistics.today_orders}/${userStatistics.daily_limit}` : '-'}
              </p>
              <p className="text-xs text-gray-500">
                Còn lại: {userStatistics?.remaining_today || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Completed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã hoàn thành</p>
              <p className="text-xl font-bold text-green-600">
                {userStatistics?.total_completed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="space-y-3">
            <Link
              href="/member/orders"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Đơn hàng của tôi</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </Link>

            <Link
              href="/member/orders"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Nhận đơn hàng mới</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </Link>

            <Link
              href="/member/profile"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Thông tin cá nhân</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Thống kê nhanh</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Giới hạn hàng ngày</p>
                <p className="text-xs text-gray-500">Số đơn tối đa mỗi ngày</p>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {userStatistics?.daily_limit || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Còn lại hôm nay</p>
                <p className="text-xs text-gray-500">Số đơn có thể nhận thêm</p>
              </div>
              <span className="text-lg font-bold text-green-600">
                {userStatistics?.remaining_today || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Hạng thành viên</p>
                <p className="text-xs text-gray-500">Cấp độ hiện tại</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMembershipTierColor(userStatistics?.membership_tier || 'basic')}`}>
                {getMembershipTierText(userStatistics?.membership_tier || 'basic')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <p className="text-gray-900">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạng thành viên</label>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getMembershipTierColor(userStatistics?.membership_tier || 'basic')}`}>
              {getMembershipTierText(userStatistics?.membership_tier || 'basic')}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Hoạt động
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
