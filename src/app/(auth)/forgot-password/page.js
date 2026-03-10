'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const supabase = createClient();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium text-zinc-900">{email}</span>.
                It may take a few minutes to arrive.
              </p>
              <Link href="/login">
                <Button variant="secondary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Send Reset Link
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center text-sm text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}