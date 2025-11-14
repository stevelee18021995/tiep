"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow">
      <div className="max-w-1xl mx-auto px-1 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Company System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Categories
              </Link>
            </div>
          </div>

          {/* Auth navigation */}
          <AuthNavigation />

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="text-gray-500 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Categories
            </Link>
          </div>

          {/* Mobile Auth navigation */}
          <AuthNavigationMobile />
        </div>
      )}
    </nav>
  );
}

// Auth navigation - simplified after removing NoSSR wrapper
function AuthNavigation() {
  const { user, isAuthenticated, isAdmin, logout, isInitialized } = useAuth();

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="hidden sm:ml-6 sm:flex sm:items-center">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
        <Link
          href="/login"
          className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center">
      <div className="ml-3 relative">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Welcome, {user?.name}</span>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium"
            >
              Admin
            </Link>
          )}
          <Link
            href="/profile"
            className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile auth navigation - simplified after removing NoSSR wrapper
function AuthNavigationMobile() {
  const { user, isAuthenticated, isAdmin, logout, isInitialized } = useAuth();

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="pt-4 pb-3 border-t border-gray-200">
        <div className="animate-pulse bg-gray-200 h-8 mx-4 rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-4 pb-3 border-t border-gray-200">
        <div className="space-y-1">
          <Link
            href="/login"
            className="text-gray-500 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-3 border-t border-gray-200">
      <div className="flex items-center px-4">
        <div className="text-base font-medium text-gray-800">Welcome, {user?.name}</div>
      </div>
      <div className="mt-3 space-y-1">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            Admin
          </Link>
        )}
        <Link
          href="/profile"
          className="text-gray-500 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
        >
          Profile
        </Link>
        <button
          onClick={logout}
          className="text-left text-red-600 hover:text-red-700 block pl-3 pr-4 py-2 text-base font-medium w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
}