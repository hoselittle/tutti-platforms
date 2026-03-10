'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BOOKING_STATUS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import Textarea from '@/components/ui/Textarea';
import { ArrowLeft, CheckCircle, Music, MapPin, Calendar, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ClientBookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params.id;
  const isNew = searchParams.get('new') === 'true';

  const [booking, setBooking] = useState(null);
  const [pianist, setPianist] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load booking
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      setBooking(bookingData);

      if (bookingData) {
        // Load pianist profile
        const { data: pianistData } = await supabase
          .from('pianist_profiles')
          .select('*')
          .eq('id', bookingData.pianist_id)
          .single();

        setPianist(pianistData);

        // Check for existing review
        const { data: review } = await supabase
          .from('reviews')
          .select('*')
          .eq('booking_id', bookingId)
          .eq('reviewer_id', user.id)
          .single();

        setExistingReview(review);
      }
    } catch (err) {
      console.error('Error loading booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setActionLoading(true);
    setError('');

    try {
      const { error: cancelError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (cancelError) throw cancelError;

      setBooking((prev) => ({ ...prev, status: 'cancelled' }));
      setSuccess('Booking cancelled.');
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!confirm('Confirm that this session has been completed?')) return;

    setActionLoading(true);
    setError('');

    try {
      const { error: completeError } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (completeError) throw completeError;

      setBooking((prev) => ({ ...prev, status: 'completed' }));
      setSuccess('Session marked as complete! You can now leave a review.');
    } catch (err) {
      setError(err.message || 'Failed to complete booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setError('Please select a rating');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          reviewer_id: user.id,
          reviewee_id: pianist?.user_id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      setExistingReview(review);
      setShowReviewForm(false);
      setSuccess('Review submitted. Thank you!');
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'paid': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'disputed': return 'danger';
      case 'refunded': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Booking not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/client/bookings"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to bookings
      </Link>

      {isNew && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-green-900">
              Booking request sent!
            </h2>
          </div>
          <p className="text-sm text-green-700 mt-1">
            The pianist has 24 hours to accept or decline.
            You won&apos;t be charged until they accept.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-6">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Booking Status */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-900">
              Booking Details
            </h1>
            <Badge variant={getStatusVariant(booking.status)}>
              {booking.status}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {booking.source === 'job_post' ? 'Via job post' : 'Direct booking'}
            {' · '}ID: {booking.id.slice(0, 8)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pianist Info */}
        <Card>
          <CardHeader>
            <CardTitle>Pianist</CardTitle>
          </CardHeader>
          <CardContent>
            {pianist && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                  <Link
                    href={`/pianist/${pianist.id}`}
                    className="text-sm font-semibold text-zinc-900 hover:underline"
                  >
                    {pianist.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={Math.round(pianist.avg_rating || 0)} size={12} />
                    <span className="text-xs text-zinc-500">
                      {formatCurrency(pianist.hourly_rate)}/hr
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="h-4 w-4" />
                <span>{booking.exam_type?.toUpperCase()} · {booking.grade}</span>
              </div>
              {booking.exam_date && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Calendar className="h-4 w-4" />
                  <span>Exam: {formatDate(booking.exam_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600">
                <Clock className="h-4 w-4" />
                <span>{booking.required_hours} hour{booking.required_hours !== 1 ? 's' : ''}</span>
              </div>
              {['paid', 'completed'].includes(booking.status) && booking.venue_address && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.venue_address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repertoire */}
      {booking.repertoire && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Repertoire</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">
              {booking.repertoire}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pricing */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">
                {formatCurrency(booking.hourly_rate)} × {booking.required_hours} hr{booking.required_hours !== 1 ? 's' : ''}
              </span>
              <span className="text-zinc-900">
                {formatCurrency(booking.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Service fee (10%)</span>
              <span className="text-zinc-900">
                {formatCurrency(booking.commission)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-200">
              <span className="text-zinc-900">Total</span>
              <span className="text-zinc-900">
                {formatCurrency(booking.client_pays)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Payment held securely until session is completed.</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="mt-6">
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Mark Complete */}
            {['accepted', 'paid'].includes(booking.status) && (
              <Button onClick={handleMarkComplete} loading={actionLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            )}

            {/* Cancel */}
            {['pending', 'accepted'].includes(booking.status) && (
              <Button
                variant="danger"
                onClick={handleCancel}
                loading={actionLoading}
              >
                Cancel Booking
              </Button>
            )}

            {/* Review */}
            {booking.status === 'completed' && !existingReview && (
              <Button onClick={() => setShowReviewForm(true)}>
                Leave a Review
              </Button>
            )}
          </div>

          {/* Existing Review */}
          {existingReview && (
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                Your Review
              </h3>
              <StarRating rating={existingReview.rating} size={14} />
              {existingReview.comment && (
                <p className="text-sm text-zinc-600 mt-2">
                  {existingReview.comment}
                </p>
              )}
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="mt-4 p-4 border border-zinc-200 rounded-lg">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                Rate your experience
              </h3>
              <StarRating
                rating={reviewRating}
                interactive={true}
                onRate={setReviewRating}
                size={24}
                className="mb-3"
              />
              <Textarea
                placeholder="Share your experience (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleSubmitReview}
                  loading={actionLoading}
                  size="sm"
                >
                  Submit Review
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}