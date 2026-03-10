'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PostJobPage() {
  const router = useRouter();
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    exam_type: '',
    grade: '',
    exam_date: '',
    repertoire: '',
    location_postcode: '',
    required_hours: '1',
    preferred_dates: '',
    budget_min: '',
    budget_max: '',
    description: '',
  });

  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
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

      setClientProfile(profile);
      if (profile?.location) {
        setFormData((prev) => ({
          ...prev,
          location_postcode: profile.location,
        }));
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a job title');
      return;
    }
    if (!formData.exam_type) {
      setError('Please select an exam type');
      return;
    }
    if (!formData.repertoire.trim()) {
      setError('Please enter repertoire details');
      return;
    }
    if (!formData.location_postcode.trim()) {
      setError('Please enter a postcode');
      return;
    }

    setSubmitting(true);

    try {
      const { data: job, error: jobError } = await supabase
        .from('job_posts')
        .insert({
          client_id: clientProfile.id,
          title: formData.title.trim(),
          exam_type: formData.exam_type,
          grade: formData.grade.trim(),
          exam_date: formData.exam_date || null,
          repertoire: formData.repertoire.trim(),
          location_postcode: formData.location_postcode.trim(),
          required_hours: parseFloat(formData.required_hours) || 1,
          preferred_dates: formData.preferred_dates.trim(),
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          description: formData.description.trim(),
          status: 'open',
        })
        .select()
        .single();

      if (jobError) throw jobError;

      router.push(`/client/jobs/${job.id}?new=true`);
    } catch (err) {
      setError(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/client/dashboard"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
          <CardDescription>
            Describe what you need and let accompanists come to you.
            Your job will be visible for 14 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Title */}
            <Input
              label="Job Title *"
              name="title"
              placeholder='e.g. "Accompanist needed for AMEB Grade 7 violin exam"'
              value={formData.title}
              onChange={handleChange}
            />

            {/* Exam Details */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Exam Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Exam Type *"
                  name="exam_type"
                  value={formData.exam_type}
                  onChange={handleChange}
                  placeholder="Select exam type"
                  options={[
                    { value: 'ameb', label: 'AMEB' },
                    { value: 'hsc', label: 'HSC' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <Input
                  label="Grade"
                  name="grade"
                  placeholder="e.g. Grade 7"
                  value={formData.grade}
                  onChange={handleChange}
                />
                <Input
                  label="Exam Date"
                  name="exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={handleChange}
                />
                <Input
                  label="Required Hours"
                  name="required_hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.required_hours}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Repertoire */}
            <Textarea
              label="Repertoire Details *"
              name="repertoire"
              placeholder="List the pieces that need accompanying. Include composer, title, and movement if applicable."
              value={formData.repertoire}
              onChange={handleChange}
              rows={3}
            />

            {/* Location & Dates */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Location & Timing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postcode *"
                  name="location_postcode"
                  placeholder="e.g. 2000"
                  value={formData.location_postcode}
                  onChange={handleChange}
                />
                <Input
                  label="Preferred Dates"
                  name="preferred_dates"
                  placeholder='e.g. "Weekends in March"'
                  value={formData.preferred_dates}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Full venue address will only be shared after you accept a pianist.
              </p>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Budget Range (Optional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min (AUD/hr)"
                  name="budget_min"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="e.g. 60"
                  value={formData.budget_min}
                  onChange={handleChange}
                />
                <Input
                  label="Max (AUD/hr)"
                  name="budget_max"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="e.g. 100"
                  value={formData.budget_max}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <Textarea
              label="Additional Description"
              name="description"
              placeholder="Any other details that would help pianists understand the job..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Post Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}