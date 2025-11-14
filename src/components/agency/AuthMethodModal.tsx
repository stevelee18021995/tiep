'use client';

import { useState, useEffect } from 'react';

interface AuthMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (method: string) => void;
  phoneNumber?: string;
  email?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export default function AuthMethodModal({ isOpen, onClose, onSubmit, phoneNumber, email, isSubmitting = false, errorMessage = '' }: AuthMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('authenticator');

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

  // Mask phone number (show last 2 digits)
  const maskPhone = (phone?: string) => {
    if (!phone) return '+12 ******31';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 2) return phone;
    const lastTwo = cleanPhone.slice(-2);
    return `+${cleanPhone.slice(0, 2)} ${'*'.repeat(6)}${lastTwo}`;
  };

  // Mask email (show first char and domain)
  const maskEmail = (emailAddr?: string) => {
    if (!emailAddr) return 's***********@gmail.com';
    const [local, domain] = emailAddr.split('@');
    if (!local || !domain) return emailAddr;
    return `${local[0]}${'*'.repeat(11)}@${domain}`;
  };

  const maskedPhone = maskPhone(phoneNumber);
  const maskedEmail = maskEmail(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedMethod);
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
        .radio-custom:checked {
          background-color: #2563eb;
          border-color: #2563eb;
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
              <h2 className="text-xl font-bold text-gray-900 pr-8">
                Choose a way to confirm that it's you
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Options - Table style with borders */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                {/* Authenticator app */}
                <label className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-200 ${selectedMethod === 'authenticator'
                  ? 'bg-blue-50/50'
                  : 'bg-white hover:bg-gray-50'
                  }`}>
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-gray-900 text-[15px] mb-0.5">Authenticator app</div>
                    <div className="text-sm text-gray-500">Authenticator app</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="authMethod"
                      value="authenticator"
                      checked={selectedMethod === 'authenticator'}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-0 focus:ring-offset-0 outline-none"
                    />
                  </div>
                </label>

                {/* SMS */}
                <label className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-200 ${selectedMethod === 'sms'
                  ? 'bg-blue-50/50'
                  : 'bg-white hover:bg-gray-50'
                  }`}>
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-gray-900 text-[15px] mb-0.5">SMS</div>
                    <div className="text-sm text-gray-500">We will send a code to the number {maskedPhone}</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="authMethod"
                      value="sms"
                      checked={selectedMethod === 'sms'}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-0 focus:ring-offset-0 outline-none"
                    />
                  </div>
                </label>

                {/* E-mail */}
                <label className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-200 ${selectedMethod === 'email'
                  ? 'bg-blue-50/50'
                  : 'bg-white hover:bg-gray-50'
                  }`}>
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-gray-900 text-[15px] mb-0.5">E-mail</div>
                    <div className="text-sm text-gray-500">We will send a code to {maskedEmail}</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="authMethod"
                      value="email"
                      checked={selectedMethod === 'email'}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-0 focus:ring-offset-0 outline-none"
                    />
                  </div>
                </label>

                {/* WhatsApp */}
                <label className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors ${selectedMethod === 'whatsapp'
                  ? 'bg-blue-50/50'
                  : 'bg-white hover:bg-gray-50'
                  }`}>
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-gray-900 text-[15px] mb-0.5">WhatsApp</div>
                    <div className="text-sm text-gray-500">We will send a code to the number {maskedPhone}</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="authMethod"
                      value="whatsapp"
                      checked={selectedMethod === 'whatsapp'}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-0 focus:ring-offset-0 outline-none"
                    />
                  </div>
                </label>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Continue button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
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
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_auth_r_0" x1="124.599" x2="159.703" y1="96.689" y2="57.25">
                    <stop offset="0.21" stopColor="#0278F1"></stop>
                    <stop offset="0.533" stopColor="#0180FA"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_auth_r_1" x1="43.859" x2="0" y1="4.984" y2="63.795">
                    <stop offset="0.427" stopColor="#0165E0"></stop>
                    <stop offset="0.917" stopColor="#0180FA"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="meta_auth_r_2" x1="28.409" x2="134.567" y1="28.907" y2="71.769">
                    <stop stopColor="#0064E0"></stop>
                    <stop offset="0.656" stopColor="#0066E2"></stop>
                    <stop offset="1" stopColor="#0278F1"></stop>
                  </linearGradient>
                </defs>
                <path d="M107.654 0c-12.3 0-21.915 9.264-30.618 21.032C65.076 5.802 55.073 0 43.103 0 18.698 0 0 31.76 0 65.376 0 86.41 10.177 99.679 27.223 99.679c12.268 0 21.092-5.784 36.778-33.203 0 0 6.539-11.547 11.037-19.501a514.1 514.1 0 0 1 4.98 8.227l7.356 12.374c14.329 23.977 22.312 32.103 36.778 32.103C140.758 99.68 150 86.23 150 64.757 150 29.56 130.88 0 107.654 0ZM52.039 59.051C39.322 78.987 34.922 83.455 27.841 83.455c-7.287 0-11.617-6.397-11.617-17.804 0-24.404 12.167-49.359 26.672-49.359 7.855 0 14.42 4.537 24.474 18.93-9.547 14.645-15.33 23.83-15.33 23.83Zm47.999-2.51-8.795-14.667c-2.38-3.87-4.66-7.428-6.862-10.689 7.927-12.234 14.465-18.33 22.241-18.33 16.155 0 29.079 23.786 29.079 53.002 0 11.137-3.647 17.599-11.205 17.599-7.244 0-10.704-4.785-24.458-26.914Z" fill="#0180FA"></path>
                <path d="M145.119 34.888h-14.878c3.44 8.718 5.46 19.42 5.46 30.969 0 11.137-3.647 17.599-11.205 17.599-1.403 0-2.663-.18-3.884-.63V99.5a33.48 33.48 0 0 0 3.54.18C140.758 99.68 150 86.23 150 64.756c0-10.702-1.768-20.882-4.881-29.87Z" fill="url(#meta_auth_r_0)"></path>
                <path d="M43.103 0c.253 0 .505.003.756.008v16.308c-.319-.016-.64-.024-.962-.024-14.138 0-26.055 23.706-26.65 47.503H.014C.588 30.77 19.08 0 43.103 0Z" fill="url(#meta_auth_r_1)"></path>
                <path d="M43.103 0c11.115 0 20.534 5.004 31.4 17.913 3.055 3.817 6.74 8.777 10.682 14.511l.017.025.024-.003c1.939 2.912 3.94 6.05 6.017 9.428l8.795 14.668c13.754 22.13 17.214 26.913 24.458 26.913h.103v16.22c-.148.003-.297.004-.447.004-14.466 0-22.449-8.126-36.778-32.103l-7.356-12.374a587.065 587.065 0 0 0-2.287-3.822l.019-.045c-5.483-8.971-8.971-14.454-11.962-18.44l-.05.037c-9.15-12.59-15.42-16.64-22.842-16.64h-.034V.001l.24-.001Z" fill="url(#meta_auth_r_2)"></path>
              </svg>
              <span className="font-semibold text-gray-900">Meta</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
