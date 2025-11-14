"use client";

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import {
  Home,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  X,
  Crown,
  Bell,
  MessageCircle,
  Wallet
} from 'lucide-react';

interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemberSidebar({ isOpen, onClose }: MemberSidebarProps) {
  const { logout } = useAuth();

  const menuItems = [
    {
      href: '/member/dashboard',
      icon: Home,
      label: 'Tổng quan',
    },
    {
      href: '/member/deposit',
      icon: Wallet,
      label: 'Nạp tiền',
    },
    {
      href: '/member/orders',
      icon: ShoppingBag,
      label: 'Đơn hàng',
    },
    {
      href: '/member/chat',
      icon: MessageCircle,
      label: 'Hỗ trợ chat',
    },
    {
      href: '/member/notifications',
      icon: Bell,
      label: 'Thông báo',
    },
    {
      href: '/member/membership',
      icon: Crown,
      label: 'Nâng cấp gói',
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Member Panel</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-gray-200 px-4 py-4 space-y-2">
          <Link
            href="/member/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Hồ sơ</span>
          </Link>

          <Link
            href="/member/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Cài đặt</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
}
