'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { AMEB_GRADES, SIGHT_READING_LABELS } from '@/lib/constants';

export default function PianistProfileEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    postcode: '',
    years_experience: '',
    ameb_experience: false,
    ameb_max_grade: '',
    hsc_experience: false,
    sight_reading: '',
    hourly_rate: '',
    bio: '',
  });

  const supabase = createClient();

  // Load existing profile data
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
          .from('pianist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setFormData({
            name: profile.name || '',
            postcode: profile.postcode || '',
            years_experience: profile.years_experience || '',
            ameb_experience: profile.ameb_experience || false,
            ameb_max_grade: profile.ameb_max_grade || '',
            hsc_experience: profile.hsc_experience || false,
            sight_reading: profile.sight_reading || '',
            hourly_rate: profile.hourly_rate || '',
            bio: profile.bio || '',
          });
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.postcode.trim()) {
      setError('Postcode is required');
      return;
    }
    if (!formData.hourly_rate) {
      setError('Hourly rate is required');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData = {
        name: formData.name.trim(),
        postcode: formData.postcode.trim(),
        years_experience: formData.years_experience
          ? parseInt(formData.years_experience)
          : 0,
        ameb_experience: formData.ameb_experience,
        ameb_max_grade: formData.ameb_experience
          ? parseInt(formData.ameb_max_grade) || null
          : null,
        hsc_experience: formData.hsc_experience,
        sight_reading: formData.sight_reading
          ? parseInt(formData.sight_reading)
          : null,
        hourly_rate: parseFloat(formData.hourly_rate),
        bio: formData.bio.trim(),
      };

      const { error: updateError } = await supabase
        .from('pianist_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      if (isNew) {
        router.push('/pianist/dashboard');
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
            Welcome to Tutti Platforms! 🎹
          </h2>
          <p className="text-sm text-blue-700 mt-1">
            Complete your profile to start receiving booking requests.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'Set Up Your Profile' : 'Edit Profile'}</CardTitle>
          <CardDescription>
            This information will be visible to clients searching for accompanists.
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

            {/* Personal Details */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Personal Details
              </h3>
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
                  label="Postcode *"
                  name="postcode"
                  placeholder="e.g. 2000"
                  value={formData.postcode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Years of Experience"
                  name="years_experience"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={formData.years_experience}
                  onChange={handleChange}
                />
                <Select
                  label="Sight-Reading Confidence"
                  name="sight_reading"
                  value={formData.sight_reading}
                  onChange={handleChange}
                  placeholder="Select level"
                  options={Object.entries(SIGHT_READING_LABELS).map(
                    ([value, label]) => ({
                      value,
                      label: `${value} — ${label}`,
                    })
                  )}
                />
              </div>

              {/* AMEB */}
              <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ameb_experience"
                    checked={formData.ameb_experience}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                  />
                  <span className="text-sm font-medium text-zinc-900">
                    I have AMEB accompaniment experience
                  </span>
                </label>

                {formData.ameb_experience && (
                  <div className="mt-3 ml-7">
                    <Select
                      label="Highest AMEB Grade Accompanied"
                      name="ameb_max_grade"
                      value={formData.ameb_max_grade}
                      onChange={handleChange}
                      placeholder="Select grade"
                      options={AMEB_GRADES.map((grade, index) => ({
                        value: index + 1,
                        label: grade,
                      }))}
                    />
                  </div>
                )}
              </div>

              {/* HSC */}
              <div className="mt-3 p-4 bg-zinc-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hsc_experience"
                    checked={formData.hsc_experience}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                  />
                  <span className="text-sm font-medium text-zinc-900">
                    I have HSC accompaniment experience
                  </span>
                </label>
              </div>
            </div>

            {/* Rate */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Rate
              </h3>
              <div className="max-w-xs">
                <Input
                  label="Hourly Rate (AUD) *"
                  name="hourly_rate"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="e.g. 80"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-zinc-400 mt-1">
                  This is the rate clients will see. You will always
                  receive your full listed rate.
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                About You
              </h3>
              <Textarea
                label="Short Bio"
                name="bio"
                placeholder="Tell clients about your experience, training, and what you specialise in..."
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
              <p className="text-xs text-zinc-400 mt-1">
                Keep it professional and concise.
              </p>
            </div>

            {/* Submit */}
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