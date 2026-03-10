'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                Password updated
              </h2>
              <p className="text-sm text-zinc-500">
                Redirecting you to login...
              </p>
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
          <CardTitle>Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Input
              label="New password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm new password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}