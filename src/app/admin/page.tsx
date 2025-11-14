"use client";

import AuthGuard from '@/components/AuthGuard';
import PermissionAlert from '@/components/PermissionAlert';
import {
  Users,
  Tag,
  Package,
  TrendingUp,
  BarChart3,
  Clock,
  Activity,
  Link,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <div className="max-w-1xl mx-auto">
        {/* Permission Alert */}
        <PermissionAlert />

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Chào mừng đến với Bảng điều khiển
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Tổng quan về hệ thống và các hoạt động quản trị
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Người dùng</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-green-600">+12% từ tháng trước</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Danh mục</p>
                <p className="text-2xl font-bold text-gray-900">56</p>
                <p className="text-xs text-green-600">+5% từ tháng trước</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Danh mục đối tượng</p>
                <p className="text-2xl font-bold text-gray-900">189</p>
                <p className="text-xs text-green-600">+8% từ tháng trước</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tăng trưởng</p>
                <p className="text-2xl font-bold text-gray-900">24%</p>
                <p className="text-xs text-green-600">+3% từ tháng trước</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/users/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Thêm người dùng mới</p>
                  <p className="text-sm text-gray-500">Tạo tài khoản người dùng mới</p>
                </div>
              </Link>

              <Link
                href="/admin/categories/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Tag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Thêm danh mục mới</p>
                  <p className="text-sm text-gray-500">Tạo danh mục mới</p>
                </div>
              </Link>

              <Link
                href="/admin/object-categories/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Thêm danh mục đối tượng</p>
                  <p className="text-sm text-gray-500">Tạo danh mục đối tượng mới</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Người dùng mới đăng ký</p>
                  <p className="text-xs text-gray-500">5 phút trước</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Tag className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Danh mục được cập nhật</p>
                  <p className="text-xs text-gray-500">1 giờ trước</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Danh mục đối tượng mới</p>
                  <p className="text-xs text-gray-500">3 giờ trước</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Báo cáo hàng tháng</p>
                  <p className="text-xs text-gray-500">1 ngày trước</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/admin/activity"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả hoạt động →
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
