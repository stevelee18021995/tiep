"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemberPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to member dashboard
    router.replace('/member/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
