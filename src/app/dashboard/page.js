'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, userProfile, loading, isPianist, isClient, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (isPianist) {
      router.push('/pianist/dashboard');
    } else if (isClient) {
      router.push('/client/dashboard');
    } else if (isAdmin) {
      router.push('/admin/dashboard');
    } else {
      // No profile yet — could be a new user
      router.push('/');
    }
  }, [user, userProfile, loading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="text-center text-zinc-500">Redirecting to your dashboard...</p>
    </div>
  );
}