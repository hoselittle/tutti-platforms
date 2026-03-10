'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, calculateCommission } from '@/lib/utils';
import { EXAM_TYPES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { ArrowLeft, Calendar, Shield, Music } from 'lucide-react';
import Link from 'next/link';

export default function BookPianistPage() {
  const router = useRouter();
  const params = useParams();
  const pianistId = params.pianistId;

  const [pianist, setPianist] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    availability_id: '',
    exam_type: '',
    grade: '',
    exam_date: '',
    repertoire: '',
    venue_address: '',
    required_hours: '1',
    notes: '',
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load pianist profile
      const { data: pianistData } = await supabase
        .from('pianist_profiles')
        .select('*')
        .eq('id', pianistId)
        .single();

      if (!pianistData) {
        router.push('/search');
        return;
      }
      setPianist(pianistData);

      // Load client profile
      const { data: clientData } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setClientProfile(clientData);

      // Load available slots
      const today = new Date().toISOString().split('T')[0];
      const { data: slots } = await supabase
        .from('availability')
        .select('*')
        .eq('pianist_id', pianistId)
        .eq('is_booked', false)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      setAvailability(slots || []);
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

  const selectedSlot = availability.find((s) => s.id === formData.availability_id);
  const totalAmount = pianist
    ? pianist.hourly_rate * parseFloat(formData.required_hours || 1)
    : 0;
  const pricing = calculateCommission(totalAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.availability_id) {
      setError('Please select a time slot');
      return;
    }
    if (!formData.exam_type) {
      setError('Please select an exam type');
      return;
    }
    if (!formData.repertoire.trim()) {
      setError('Please enter your repertoire details');
      return;
    }
    if (!formData.venue_address.trim()) {
      setError('Please enter the venue address');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: clientProfile.id,
          pianist_id: pianistId,
          availability_id: formData.availability_id,
          source: 'direct',
          exam_type: formData.exam_type,
          grade: formData.grade.trim(),
          exam_date: formData.exam_date || null,
          repertoire: formData.repertoire.trim(),
          venue_address: formData.venue_address.trim(),
          location_postcode: clientProfile.location || '',
          required_hours: parseFloat(formData.required_hours),
          notes: formData.notes.trim(),
          hourly_rate: pianist.hourly_rate,
          total_amount: pricing.totalAmount,
          commission: pricing.commission,
          client_pays: pricing.clientPays,
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Redirect to booking confirmation
      router.push(`/client/bookings/${booking.id}?new=true`);
    } catch (err) {
      setError(err.message || 'Failed to create booking request');
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

  if (!pianist) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Pianist not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href={`/pianist/${pianistId}`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to profile
      </Link>

      {/* Pianist Summary */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <Music className="h-6 w-6 text-zinc-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-900">
                Book {pianist.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={Math.round(pianist.avg_rating || 0)} size={12} />
                <span className="text-xs text-zinc-500">
                  {formatCurrency(pianist.hourly_rate)}/hr
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>
            Fill in your session details. The pianist will review and accept or
            decline within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Time Slot Selection */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
                Select Time Slot *
              </h3>
              {availability.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availability.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          availability_id: slot.id,
                        }))
                      }
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        formData.availability_id === slot.id
                          ? 'border-zinc-900 bg-zinc-50'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-zinc-900">
                        {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-AU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-zinc-50 rounded-lg text-center">
                  <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">
                    No available time slots.
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Try posting a job instead — the pianist can propose times.
                  </p>
                </div>
              )}
            </div>

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
                  label="Required Hours *"
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
              placeholder="List the pieces you need accompanied. Include composer, title, and movement if applicable."
              value={formData.repertoire}
              onChange={handleChange}
              rows={3}
            />

            {/* Venue */}
            <Input
              label="Venue Address *"
              name="venue_address"
              placeholder="Where will the session take place?"
              value={formData.venue_address}
              onChange={handleChange}
            />
            <p className="text-xs text-zinc-400 -mt-4">
              This will only be shared with the pianist after they accept.
            </p>

            {/* Notes */}
            <Textarea
              label="Additional Notes"
              name="notes"
              placeholder="Any other information the pianist should know (max 500 characters)"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              maxLength={500}
            />

            {/* Pricing Summary */}
            <div className="p-4 bg-zinc-50 rounded-lg">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                Pricing Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">
                    {formatCurrency(pianist.hourly_rate)} × {formData.required_hours || 1} hour{parseFloat(formData.required_hours || 1) !== 1 ? 's' : ''}
                  </span>
                  <span className="text-zinc-900">
                    {formatCurrency(pricing.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Service fee (10%)</span>
                  <span className="text-zinc-900">
                    {formatCurrency(pricing.commission)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-200">
                  <span className="text-zinc-900">Total</span>
                  <span className="text-zinc-900">
                    {formatCurrency(pricing.clientPays)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                <Shield className="h-3.5 w-3.5" />
                <span>
                  Payment is held securely until the session is completed.
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={submitting}
              disabled={!formData.availability_id}
            >
              Send Booking Request
            </Button>

            <p className="text-xs text-zinc-400 text-center">
              The pianist has 24 hours to accept or decline.
              You won&apos;t be charged until they accept.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}