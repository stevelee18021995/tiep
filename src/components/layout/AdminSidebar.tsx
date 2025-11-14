"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import NoSSR from '@/components/NoSSR';

interface AdminSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

function AdminSidebarContent({ setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Người dùng', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Đơn hàng', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6' },
    { name: 'Nạp rút tiền', href: '/admin/deposit-requests', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Nâng cấp gói', href: '/admin/membership-upgrades', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { name: 'Chat hỗ trợ', href: '/admin/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { name: 'Danh mục', href: '/admin/categories', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { name: 'Danh mục đối tượng', href: '/admin/object-categories', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Sản phẩm', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21H7a2 2 0 01-2-2V5a2 2 0 012-2h2m0 16h2a2 2 0 002-2V5a2 2 0 00-2-2h-2m-6 8h6' },
  ];

  return (
    <nav className="space-y-1 px-3">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setSidebarOpen?.(false)} // Đóng sidebar khi click trên mobile
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${isActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <svg
              className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive
                ? 'text-blue-600'
                : 'text-gray-400 group-hover:text-gray-600'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo/Brand */}
        <div className="flex items-center justify-between py-4 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0l11.196 6v12l-11.196 6-11.196-6v-12z" />
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-lg">Bảng điều khiển</span>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen?.(false)}
          >
            <span className="sr-only">Đóng sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <div className="py-4">
          <NoSSR fallback={
            <nav className="space-y-1 px-3">
              {/* Static fallback navigation for SSR */}
              <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                <div className="mr-3 h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="bg-gray-300 h-4 w-16 rounded animate-pulse"></div>
              </div>
            </nav>
          }>
            <AdminSidebarContent setSidebarOpen={setSidebarOpen} />
          </NoSSR>
        </div>
      </aside>
    </>
  );
}
