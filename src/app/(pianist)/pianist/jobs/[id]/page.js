'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Send } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [pianistProfile, setPianistProfile] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    cover_message: '',
    proposed_rate: '',
    available_dates: '',
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load job
      const { data: jobData } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', jobId)
        .single();

      setJob(jobData);

      // Load pianist profile
      const { data: profile } = await supabase
        .from('pianist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setPianistProfile(profile);

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          proposed_rate: profile.hourly_rate?.toString() || '',
        }));

        // Check if already applied
        const { data: application } = await supabase
          .from('applications')
          .select('*')
          .eq('job_id', jobId)
          .eq('pianist_id', profile.id)
          .single();

        setExistingApplication(application);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.cover_message.trim()) {
      setError('Please write a cover message');
      return;
    }
    if (!formData.proposed_rate) {
      setError('Please enter your proposed rate');
      return;
    }

    setSubmitting(true);

    try {
      const proposedRate = parseFloat(formData.proposed_rate);
      const proposedTotal = proposedRate * (job.required_hours || 1);

      const { data: application, error: applyError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          pianist_id: pianistProfile.id,
          cover_message: formData.cover_message.trim(),
          proposed_rate: proposedRate,
          proposed_total: proposedTotal,
          available_dates: formData.available_dates.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (applyError) throw applyError;

      setExistingApplication(application);
      setSuccess('Application submitted successfully!');
    } catch (err) {
      if (err.message?.includes('duplicate')) {
        setError('You have already applied to this job.');
      } else {
        setError(err.message || 'Failed to submit application');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw your application?')) return;

    try {
      const { error: withdrawError } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', existingApplication.id);

      if (withdrawError) throw withdrawError;

      setExistingApplication(null);
      setSuccess('Application withdrawn.');
    } catch (err) {
      setError(err.message || 'Failed to withdraw');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/pianist/jobs"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to jobs
      </Link>

      {/* Job Details */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-zinc-900">{job.title}</h1>
            <Badge
              variant={job.status === 'open' ? 'success' : 'default'}
            >
              {job.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location_postcode}
            </span>
            {job.exam_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Exam: {new Date(job.exam_date).toLocaleDateString('en-AU')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {job.required_hours} hour{job.required_hours !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {job.application_count} pianist{job.application_count !== 1 ? 's' : ''} applied
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="info">{job.exam_type?.toUpperCase()}</Badge>
            {job.grade && <Badge variant="default">{job.grade}</Badge>}
            {job.budget_min && job.budget_max && (
              <Badge variant="default">
                {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}/hr
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                Repertoire
              </h3>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                {job.repertoire}
              </p>
            </div>

            {job.preferred_dates && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                  Preferred Dates
                </h3>
                <p className="text-sm text-zinc-600">{job.preferred_dates}</p>
              </div>
            )}

            {job.description && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                  Additional Details
                </h3>
                <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-400 mt-4">
            Posted {new Date(job.created_at).toLocaleDateString('en-AU')}
          </p>
        </CardContent>
      </Card>

      {/* Application Section */}
      {job.status === 'open' && (
        <>
          {existingApplication ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Application</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600">Status:</span>
                    <Badge
                      variant={
                        existingApplication.status === 'accepted'
                          ? 'success'
                          : existingApplication.status === 'rejected'
                          ? 'danger'
                          : existingApplication.status === 'withdrawn'
                          ? 'default'
                          : 'warning'
                      }
                    >
                      {existingApplication.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-600">Proposed rate: </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {formatCurrency(existingApplication.proposed_rate)}/hr
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-600">Your message:</span>
                    <p className="text-sm text-zinc-700 mt-1 p-3 bg-zinc-50 rounded-lg">
                      {existingApplication.cover_message}
                    </p>
                  </div>

                  {existingApplication.status === 'pending' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleWithdraw}
                    >
                      Withdraw Application
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Apply for this Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApply} className="space-y-4">
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

                  <Textarea
                    label="Cover Message *"
                    name="cover_message"
                    placeholder="Introduce yourself and explain why you're a good fit for this job..."
                    value={formData.cover_message}
                    onChange={handleChange}
                    rows={4}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Proposed Hourly Rate (AUD) *"
                      name="proposed_rate"
                      type="number"
                      min="0"
                      step="5"
                      placeholder="e.g. 80"
                      value={formData.proposed_rate}
                      onChange={handleChange}
                    />
                    <Input
                      label="Your Available Dates"
                      name="available_dates"
                      placeholder='e.g. "March 15, 22, 29"'
                      value={formData.available_dates}
                      onChange={handleChange}
                    />
                  </div>

                  {formData.proposed_rate && (
                    <div className="p-3 bg-zinc-50 rounded-lg">
                      <p className="text-sm text-zinc-600">
                        Estimated total:{' '}
                        <span className="font-semibold text-zinc-900">
                          {formatCurrency(
                            parseFloat(formData.proposed_rate) * (job.required_hours || 1)
                          )}
                        </span>
                        <span className="text-zinc-400">
                          {' '}({formatCurrency(parseFloat(formData.proposed_rate))}/hr × {job.required_hours || 1} hrs)
                        </span>
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" loading={submitting}>
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}