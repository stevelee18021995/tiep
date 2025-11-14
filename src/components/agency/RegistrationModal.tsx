'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const countries = [
  { code: '+1', iso: 'US', name: 'United States' },
  { code: '+44', iso: 'GB', name: 'United Kingdom' },
  { code: '+86', iso: 'CN', name: 'China' },
  { code: '+81', iso: 'JP', name: 'Japan' },
  { code: '+82', iso: 'KR', name: 'South Korea' },
  { code: '+91', iso: 'IN', name: 'India' },
  { code: '+33', iso: 'FR', name: 'France' },
  { code: '+49', iso: 'DE', name: 'Germany' },
  { code: '+39', iso: 'IT', name: 'Italy' },
  { code: '+34', iso: 'ES', name: 'Spain' },
  { code: '+7', iso: 'RU', name: 'Russia' },
  { code: '+61', iso: 'AU', name: 'Australia' },
  { code: '+55', iso: 'BR', name: 'Brazil' },
  { code: '+52', iso: 'MX', name: 'Mexico' },
  { code: '+27', iso: 'ZA', name: 'South Africa' },
  { code: '+20', iso: 'EG', name: 'Egypt' },
  { code: '+62', iso: 'ID', name: 'Indonesia' },
  { code: '+66', iso: 'TH', name: 'Thailand' },
  { code: '+60', iso: 'MY', name: 'Malaysia' },
  { code: '+65', iso: 'SG', name: 'Singapore' },
  { code: '+63', iso: 'PH', name: 'Philippines' },
  { code: '+92', iso: 'PK', name: 'Pakistan' },
  { code: '+880', iso: 'BD', name: 'Bangladesh' },
  { code: '+90', iso: 'TR', name: 'Turkey' },
  { code: '+971', iso: 'AE', name: 'UAE' },
  { code: '+966', iso: 'SA', name: 'Saudi Arabia' },
  { code: '+972', iso: 'IL', name: 'Israel' },
  { code: '+64', iso: 'NZ', name: 'New Zealand' },
  { code: '+31', iso: 'NL', name: 'Netherlands' },
  { code: '+32', iso: 'BE', name: 'Belgium' },
  { code: '+41', iso: 'CH', name: 'Switzerland' },
  { code: '+46', iso: 'SE', name: 'Sweden' },
  { code: '+47', iso: 'NO', name: 'Norway' },
  { code: '+45', iso: 'DK', name: 'Denmark' },
  { code: '+48', iso: 'PL', name: 'Poland' },
  { code: '+84', iso: 'VN', name: 'Vietnam' },
  { code: '+420', iso: 'CZ', name: 'Czech Republic' },
  { code: '+351', iso: 'PT', name: 'Portugal' },
  { code: '+30', iso: 'GR', name: 'Greece' },
  { code: '+353', iso: 'IE', name: 'Ireland' },
  { code: '+358', iso: 'FI', name: 'Finland' },
  { code: '+43', iso: 'AT', name: 'Austria' },
];

export default function RegistrationModal({ isOpen, onClose, onSubmit }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    emailBusiness: '',
    pageName: '',
    countryCode: '+1',
    phoneNumber: '',
    dayOfBirth: '',
    monthOfBirth: '',
    yearOfBirth: '',
    issue: '',
    agreeTerms: true,
    sendNotification: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  const selectedCountry = countries.find(c => c.code === formData.countryCode) || countries[0];
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Email Business validation (optional but must be valid if provided)
    if (formData.emailBusiness.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailBusiness)) {
      newErrors.emailBusiness = 'Please enter a valid business email address';
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{8,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 8-15 digits';
    }

    // Date of Birth validation
    if (!formData.dayOfBirth || !formData.monthOfBirth || !formData.yearOfBirth) {
      newErrors.dayOfBirth = 'Complete date of birth is required';
    } else {
      const birthDate = new Date(
        parseInt(formData.yearOfBirth),
        parseInt(formData.monthOfBirth) - 1,
        parseInt(formData.dayOfBirth)
      );
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (birthDate > today) {
        newErrors.dayOfBirth = 'Date of birth cannot be in the future';
      } else if (actualAge < 18) {
        newErrors.dayOfBirth = 'You must be at least 18 years old';
      } else if (actualAge > 120) {
        newErrors.dayOfBirth = 'Please enter a valid date of birth';
      }
    }

    // Issue description validation (optional)
    if (formData.issue.trim() && formData.issue.trim().length < 20) {
      newErrors.issue = 'Description must be at least 20 characters';
    } else if (formData.issue.trim().length > 500) {
      newErrors.issue = 'Description must not exceed 500 characters';
    }

    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms of use';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSending(true);

      // Simulate sending delay 2 seconds
      setTimeout(() => {
        setIsSending(false);
        onSubmit(formData);
      }, 2000);
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
          <div className="sticky top-0 border-b border-gray-200 px-6 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #f9f1f9, #ecf7f8)' }}>
            <h3 className="text-xl font-bold text-gray-900">Join Meta Agency Program</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Email Business */}
              <div>
                <input
                  type="email"
                  placeholder="Email Business (Optional)"
                  className={`w-full px-3 py-2 border ${errors.emailBusiness ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                  value={formData.emailBusiness}
                  onChange={(e) => {
                    setFormData({ ...formData, emailBusiness: e.target.value });
                    if (errors.emailBusiness) setErrors({ ...errors, emailBusiness: undefined });
                  }}
                />
                {errors.emailBusiness && (
                  <p className="mt-1 text-xs text-red-600">{errors.emailBusiness}</p>
                )}
              </div>

              {/* Page Name */}
              <div>
                <input
                  type="text"
                  placeholder="Page Name (Optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                  value={formData.pageName}
                  onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                />
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <div className="flex gap-1 sm:gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm w-24 sm:w-32 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <img
                        src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`}
                        alt={selectedCountry.name}
                        className="w-5 h-4 object-cover rounded flex-shrink-0"
                      />
                      <span className="text-gray-700 text-xs sm:text-sm">{selectedCountry.code}</span>
                      <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-auto text-gray-400 transition-transform flex-shrink-0 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {countryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setCountryDropdownOpen(false)}
                        />
                        <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search country or code..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="overflow-y-auto max-h-52 scrollbar-hide">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, countryCode: country.code });
                                  setCountryDropdownOpen(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 text-left ${formData.countryCode === country.code ? 'bg-blue-50' : ''
                                  }`}
                              >
                                <img
                                  src={`https://flagcdn.com/w20/${country.iso.toLowerCase()}.png`}
                                  alt={country.name}
                                  className="w-5 h-4 object-cover rounded"
                                />
                                <span className="text-sm text-gray-900 flex-1">{country.name}</span>
                                <span className="text-sm text-gray-500">{country.code}</span>
                              </button>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div className="px-3 py-4 text-center text-sm text-gray-500">
                                No countries found
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className={`flex-1 px-3 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, phoneNumber: e.target.value });
                      if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                    }}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Birth</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className={`px-3 py-2 border ${errors.dayOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                    value={formData.dayOfBirth}
                    onChange={(e) => {
                      setFormData({ ...formData, dayOfBirth: e.target.value });
                      if (errors.dayOfBirth) setErrors({ ...errors, dayOfBirth: undefined });
                    }}
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <select
                    className={`px-3 py-2 border ${errors.dayOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                    value={formData.monthOfBirth}
                    onChange={(e) => {
                      setFormData({ ...formData, monthOfBirth: e.target.value });
                      if (errors.dayOfBirth) setErrors({ ...errors, dayOfBirth: undefined });
                    }}
                  >
                    <option value="">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                      <option key={i} value={i + 1}>{month}</option>
                    ))}
                  </select>
                  <select
                    className={`px-3 py-2 border ${errors.dayOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                    value={formData.yearOfBirth}
                    onChange={(e) => {
                      setFormData({ ...formData, yearOfBirth: e.target.value });
                      if (errors.dayOfBirth) setErrors({ ...errors, dayOfBirth: undefined });
                    }}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => 2024 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errors.dayOfBirth && (
                  <p className="mt-1 text-xs text-red-600">{errors.dayOfBirth}</p>
                )}
              </div>

              {/* Describe your issue */}
              <div>
                <textarea
                  placeholder="Describe your issue (Optional)"
                  rows={3}
                  className={`w-full px-3 py-2 border ${errors.issue ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm`}
                  value={formData.issue}
                  onChange={(e) => {
                    setFormData({ ...formData, issue: e.target.value });
                    if (errors.issue) setErrors({ ...errors, issue: undefined });
                  }}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.issue ? (
                    <p className="text-xs text-red-600">{errors.issue}</p>
                  ) : (
                    <p className="text-xs text-gray-500">{formData.issue.length}/500 characters</p>
                  )}
                </div>
              </div>

              {/* Response time notice */}
              <p className="text-sm text-gray-500">
                Our response will be sent to you within 14 - 48 hours.
              </p>

              {/* Facebook notification toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">on Facebook</div>
                    <div className="text-xs text-gray-500">We will send you a notification on Facebook.</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.sendNotification}
                    onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Terms checkbox */}
              <div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${errors.agreeTerms ? 'border-red-500' : ''}`}
                    checked={formData.agreeTerms}
                    onChange={(e) => {
                      setFormData({ ...formData, agreeTerms: e.target.checked });
                      if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
                    }}
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                    I agree with{' '}
                    <a href="#" className="text-blue-600 hover:underline">Terms of use</a>
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="mt-1 text-xs text-red-600">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
