"use client";

import AuthWrapper from '@/components/AuthWrapper';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <AuthWrapper>
      <RegisterForm />
    </AuthWrapper>
  );
}