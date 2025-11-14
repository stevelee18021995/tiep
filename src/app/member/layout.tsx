"use client";

import { useState } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import AuthGuard from '@/components/AuthGuard';
import { MemberSidebar, MemberHeader } from '@/components/layout';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthWrapper>
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <MemberSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <MemberHeader onMenuClick={() => setSidebarOpen(true)} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </AuthWrapper>
  );
}
