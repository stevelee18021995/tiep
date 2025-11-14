"use client";

import AuthWrapper from '@/components/AuthWrapper';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <AuthWrapper>
      <LoginForm />
    </AuthWrapper>
  );
}
