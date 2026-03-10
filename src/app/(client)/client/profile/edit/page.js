'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CLIENT_TYPES } from '@/lib/constants';

export default function ClientProfileEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    role_type: '',
  });

  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setFormData({
            name: profile.name || '',
            email: profile.email || user.email || '',
            location: profile.location || '',
            role_type: profile.role_type || '',
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            email: user.email || '',
          }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        role_type: formData.role_type || null,
      };

      const { error: updateError } = await supabase
        .from('client_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      if (isNew) {
        router.push('/client/dashboard');
      } else {
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-center text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {isNew && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-base font-semibold text-blue-900">
            Welcome to Tutti Platforms! 🎵
          </h2>
          <p className="text-sm text-blue-700 mt-1">
            Complete your profile to start searching for accompanists.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'Set Up Your Profile' : 'Edit Profile'}</CardTitle>
          <CardDescription>
            Tell us a bit about yourself so pianists know who they&apos;re working with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="I am a..."
                name="role_type"
                value={formData.role_type}
                onChange={handleChange}
                placeholder="Select your role"
                options={[
                  { value: CLIENT_TYPES.STUDENT, label: 'Student' },
                  { value: CLIENT_TYPES.PARENT, label: 'Parent' },
                  { value: CLIENT_TYPES.TEACHER, label: 'Teacher' },
                ]}
              />
              <Input
                label="Location (Suburb or Postcode)"
                name="location"
                placeholder="e.g. 2000 or Surry Hills"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              {!isNew && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={saving}>
                {isNew ? 'Complete Profile' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}