"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PermissionAlert() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const reasonParam = searchParams.get('reason');
    
    if (errorParam === 'insufficient_permissions') {
      setError('Bạn không có quyền truy cập vào trang quản trị');
    }
    
    if (reasonParam === 'authentication_required') {
      setReason('Vui lòng đăng nhập để tiếp tục');
    }
  }, [searchParams]);

  if (!error && !reason) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {error ? (
            <Shield className="h-6 w-6 text-red-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-orange-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            {error ? 'Quyền truy cập bị từ chối' : 'Yêu cầu đăng nhập'}
          </h3>
          <p className="text-sm text-red-700">
            {error || reason}
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-2">
              Chỉ có quản trị viên mới có thể truy cập vào khu vực này.
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
