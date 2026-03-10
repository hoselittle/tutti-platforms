'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      // 2. Get user role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. Redirect based on role or redirect param
      if (redirectTo) {
        router.push(redirectTo);
      } else if (profile.role === 'pianist') {
        router.push('/pianist/dashboard');
      } else if (profile.role === 'client') {
        router.push('/client/dashboard');
      } else if (profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }

      // Force refresh to update header
      router.refresh();
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Log in to your Tutti Platforms account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Redirect Message */}
            {redirectTo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  Please log in to continue.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Log In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <p className="text-sm text-zinc-500 text-center">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-zinc-900 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}