'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, calculateCommission } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { ArrowLeft, Music, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ClientJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id;
  const isNew = searchParams.get('new') === 'true';

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load client profile
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setClientProfile(profile);

      // Load job
      const { data: jobData } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', jobId)
        .single();

      setJob(jobData);

      // Load applications with pianist profiles
      const { data: apps } = await supabase
        .from('applications')
        .select(`
          *,
          pianist_profiles:pianist_id (
            id,
            name,
            postcode,
            avg_rating,
            total_reviews,
            years_experience,
            ameb_experience,
            hsc_experience,
            hourly_rate
          )
        `)
        .eq('job_id', jobId)
        .neq('status', 'withdrawn')
        .order('created_at', { ascending: false });

      setApplications(apps || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (application) => {
    if (!confirm(`Accept ${application.pianist_profiles.name}'s application?`)) return;

    setAccepting(application.id);
    setError('');

    try {
      const pricing = calculateCommission(
        application.proposed_rate * (job.required_hours || 1)
      );

      // 1. Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: clientProfile.id,
          pianist_id: application.pianist_id,
          source: 'job_post',
          job_id: jobId,
          application_id: application.id,
          exam_type: job.exam_type,
          grade: job.grade,
          exam_date: job.exam_date,
          repertoire: job.repertoire,
          venue_address: job.venue_address || '',
          location_postcode: job.location_postcode,
          required_hours: job.required_hours,
          hourly_rate: application.proposed_rate,
          total_amount: pricing.totalAmount,
          commission: pricing.commission,
          client_pays: pricing.clientPays,
          status: 'accepted',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Update accepted application
      await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', application.id);

      // 3. Reject all other applications
      await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('id', application.id)
        .neq('status', 'withdrawn');

      // 4. Update job status
      await supabase
        .from('job_posts')
        .update({
          status: 'assigned',
          booking_id: booking.id,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Redirect to booking
      router.push(`/client/bookings/${booking.id}?new=true`);
    } catch (err) {
      setError(err.message || 'Failed to accept application');
    } finally {
      setAccepting(null);
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
        href="/client/jobs"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to my jobs
      </Link>

      {isNew && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-green-900">
              Job posted successfully!
            </h2>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Pianists can now see your job and apply. You&apos;ll be notified
            when applications come in.
          </p>
        </div>
      )}

      {/* Job Summary */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-bold text-zinc-900">{job.title}</h1>
            <Badge
              variant={
                job.status === 'open'
                  ? 'success'
                  : job.status === 'assigned'
                  ? 'info'
                  : 'default'
              }
            >
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 mb-2">
            {job.exam_type?.toUpperCase()} · {job.grade} · {job.required_hours} hours
          </p>
          <p className="text-sm text-zinc-500">
            <MapPin className="h-3 w-3 inline mr-1" />
            {job.location_postcode}
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle>
            Applications ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-zinc-200 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                        <Music className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <Link
                          href={`/pianist/${app.pianist_profiles.id}`}
                          className="text-sm font-semibold text-zinc-900 hover:underline"
                        >
                          {app.pianist_profiles.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating
                            rating={Math.round(app.pianist_profiles.avg_rating || 0)}
                            size={12}
                          />
                          <span className="text-xs text-zinc-500">
                            {app.pianist_profiles.avg_rating
                              ? `${Number(app.pianist_profiles.avg_rating).toFixed(1)}`
                              : 'New'}
                          </span>
                          <span className="text-xs text-zinc-300">·</span>
                          <span className="text-xs text-zinc-500">
                            {app.pianist_profiles.years_experience}yr exp
                          </span>
                        </div>

                        {/* Experience Tags */}
                        <div className="flex gap-1 mt-1">
                          {app.pianist_profiles.ameb_experience && (
                            <Badge variant="info">AMEB</Badge>
                          )}
                          {app.pianist_profiles.hsc_experience && (
                            <Badge variant="info">HSC</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-zinc-900">
                        {formatCurrency(app.proposed_rate)}/hr
                      </p>
                      <p className="text-xs text-zinc-500">
                        Total: {formatCurrency(app.proposed_total)}
                      </p>
                      <Badge
                        variant={
                          app.status === 'accepted'
                            ? 'success'
                            : app.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        className="mt-1"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Cover Message */}
                  <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-700">
                      {app.cover_message}
                    </p>
                  </div>

                  {app.available_dates && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Available: {app.available_dates}
                    </p>
                  )}

                  {/* Actions */}
                  {job.status === 'open' && app.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptApplication(app)}
                        loading={accepting === app.id}
                      >
                        Accept & Book
                      </Button>
                      <Link href={`/pianist/${app.pianist_profiles.id}`}>
                        <Button variant="secondary" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500">
                No applications yet. Pianists will be able to see your
                job and apply.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}