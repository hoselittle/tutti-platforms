'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import RoleSwitcher from '@/components/layout/RoleSwitcher';
import ClientNav from '@/components/layout/ClientNav';
import PianistNav from '@/components/layout/PianistNav';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, loading, signOut, isPianist, isClient } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Active states for global links
  const isSearchActive = pathname?.startsWith('/search');
  const isJobsActive = pathname?.startsWith('/jobs');

  const isPianistRoute = pathname?.startsWith('/pianist');
  const isClientRoute = pathname?.startsWith('/client');

  // 1. 👉 Determine the "Effective Role" based on URL or User Data
  let effectiveRole = 'client'; // Default fallback
  if (isPianistRoute) {
    effectiveRole = 'pianist';
  } else if (isClientRoute) {
    effectiveRole = 'client';
  } else if (isPianist && !isClient) {
    effectiveRole = 'pianist'; // If they are ONLY a pianist, force pianist mode on global pages
  }
  // Note: If a user has BOTH roles and is on a global page, it safely defaults to 'client'. 
  // They can always use the RoleSwitcher to jump back to their Pianist dashboard!

  // 2. 👉 Dynamic Logo Href: Logged out -> "/", Logged In -> Their Dashboard (Discovery Page)
  const logoHref = user ? `/${effectiveRole}/dashboard` : '/';

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo (Now Dynamic!) */}
          <Link href={logoHref} className="flex items-center">
            <span className="text-xl font-bold text-zinc-900">Tutti</span>
            <span className="text-xl font-light text-zinc-500 ml-1">Platforms</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className={cn(
                "transition-colors text-sm",
                isSearchActive ? "text-zinc-900 font-semibold" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Find Pianists
            </Link>
            <Link
              href="/jobs"
              className={cn(
                "transition-colors text-sm",
                isJobsActive ? "text-zinc-900 font-semibold" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Browse Jobs
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    
                    {/* 3. 👉 Use effectiveRole to keep navigation visible on global pages! */}
                    {effectiveRole === 'pianist' && <PianistNav />}
                    {effectiveRole === 'client' && <ClientNav />}

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
              className={cn(
                "block py-2 text-sm transition-colors",
                isSearchActive ? "text-zinc-900 font-semibold" : "text-zinc-600 hover:text-zinc-900"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Pianists
            </Link>
            <Link
              href="/jobs"
              className={cn(
                "block py-2 text-sm transition-colors",
                isJobsActive ? "text-zinc-900 font-semibold" : "text-zinc-600 hover:text-zinc-900"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Jobs
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    {/* 4. 👉 Use effectiveRole for Mobile Nav too! */}
                    {effectiveRole === 'pianist' && (
                      <PianistNav 
                        isMobile 
                        onLinkClick={() => setMobileMenuOpen(false)} 
                      />
                    )}

                    {effectiveRole === 'client' && (
                      <ClientNav 
                        isMobile 
                        onLinkClick={() => setMobileMenuOpen(false)} 
                      />
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