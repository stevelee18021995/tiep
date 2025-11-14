"use client";

import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push('/unauthorized');
      return;
    }
  }, [isInitialized, isAuthenticated, isAdmin, requireAuth, requireAdmin, router]);

  // Đợi khởi tạo
  if (!isInitialized) {
    return null;
  }

  // Render children sau khi đã kiểm tra xác thực
  return <>{children}</>;
}
