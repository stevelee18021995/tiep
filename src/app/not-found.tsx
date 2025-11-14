'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to right, #f9f1f9, #ecf7f8)' }}>
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Meta Logo */}
          <div className="flex justify-center mb-8">
            <svg aria-label="Meta Icon" height="48" role="img" viewBox="0 0 150 100" width="72">
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
          </div>

          {/* 404 Error */}
          <div className="mb-6">
            <h1 className="text-[120px] md:text-[180px] font-bold text-gray-200 leading-none select-none">
              404
            </h1>
          </div>

          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-gray-100 rounded-full p-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-md mx-auto">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>

          {/* Link */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Return to{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                Accounts Centre
              </Link>
            </p>
          </div>
        </div>

        {/* Meta Branding */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
