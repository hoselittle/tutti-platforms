'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import RoleSwitcher from '@/components/layout/RoleSwitcher';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, loading, signOut, isPianist, isClient } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-zinc-900">Tutti</span>
            <span className="text-xl font-light text-zinc-500 ml-1">Platforms</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Find Pianists
            </Link>
            <Link
              href="/jobs"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Browse Jobs
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    {/* Role-Based Links */}
                    {isPianist && (
                      <>
                        <Link
                          href="/pianist/dashboard"
                          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/pianist/availability"
                          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          Availability
                        </Link>
                        <Link
                          href="/pianist/bookings"
                          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          Bookings
                        </Link>
                      </>
                    )}

                    {isClient && (
                      <>
                        <Link
                          href="/client/dashboard"
                          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/client/post-job"
                          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          Post Job
                        </Link>
                        <Link
                          href="/client/bookings"
                          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          Bookings
                        </Link>
                      </>
                    )}

                    {/* Role Switcher */}
                    <RoleSwitcher />

                    <Button variant="secondary" size="sm" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Log In</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/search"
              className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Pianists
            </Link>
            <Link
              href="/jobs"
              className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Jobs
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    {isPianist && (
                      <>
                        <Link
                          href="/pianist/dashboard"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Pianist Dashboard
                        </Link>
                        <Link
                          href="/pianist/profile/edit"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Pianist Profile
                        </Link>
                        <Link
                          href="/pianist/availability"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Availability
                        </Link>
                        <Link
                          href="/pianist/bookings"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Pianist Bookings
                        </Link>
                      </>
                    )}

                    {isClient && (
                      <>
                        <Link
                          href="/client/dashboard"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Client Dashboard
                        </Link>
                        <Link
                          href="/client/profile/edit"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Client Profile
                        </Link>
                        <Link
                          href="/client/post-job"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Post Job
                        </Link>
                        <Link
                          href="/client/bookings"
                          className="block text-sm text-zinc-600 hover:text-zinc-900 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Client Bookings
                        </Link>
                      </>
                    )}

                    {/* Mobile Role Switcher */}
                    <div className="py-2">
                      <RoleSwitcher />
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}