import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { SIGHT_READING_LABELS, AMEB_GRADES } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import Card, { CardContent } from '@/components/ui/Card';
import BookingCTA from '@/components/booking/BookingCTA';
import {
  MapPin,
  Clock,
  DollarSign,
  Music,
  GraduationCap,
  BookOpen,
  Eye,
} from 'lucide-react';

// Server component — SEO friendly
export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pianist } = await supabase
    .from('pianist_profiles')
    .select('name, bio, postcode')
    .eq('id', id)
    .single();

  if (!pianist) {
    return { title: 'Pianist Not Found' };
  }

  return {
    title: `${pianist.name} — Accompanist | Tutti Platforms`,
    description: pianist.bio || `Book ${pianist.name} as your piano accompanist in Sydney.`,
  };
}

export default async function PianistProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch pianist profile
  const { data: pianist, error } = await supabase
    .from('pianist_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !pianist) {
    notFound();
  }

  // Fetch reviews for this pianist
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer_id
    `)
    .eq('reviewee_id', pianist.user_id)
    .order('created_at', { ascending: false });

  // Fetch available slots
  const today = new Date().toISOString().split('T')[0];
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('pianist_id', pianist.id)
    .eq('is_booked', false)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(20);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content — Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar Placeholder */}
                <div className="w-24 h-24 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
                  <Music className="h-10 w-10 text-zinc-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-zinc-900">
                        {pianist.name}
                      </h1>
                      <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                        <MapPin className="h-4 w-4" />
                        <span>Sydney, {pianist.postcode}</span>
                      </div>
                    </div>
                    {pianist.is_verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <StarRating rating={Math.round(pianist.avg_rating || 0)} />
                    <span className="text-sm text-zinc-600">
                      {pianist.avg_rating
                        ? `${Number(pianist.avg_rating).toFixed(1)} (${pianist.total_reviews} reviews)`
                        : 'No reviews yet'}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-zinc-900">
                        {formatCurrency(pianist.hourly_rate)}
                      </span>
                      <span>/ hour</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {pianist.years_experience} years experience
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {pianist.total_bookings} bookings completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          {pianist.bio && (
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">
                  About
                </h2>
                <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                  {pianist.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Experience & Skills */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                Experience & Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AMEB */}
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5 text-zinc-700" />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      AMEB Experience
                    </h3>
                  </div>
                  {pianist.ameb_experience ? (
                    <div>
                      <Badge variant="success">Yes</Badge>
                      {pianist.ameb_max_grade && (
                        <p className="text-sm text-zinc-600 mt-2">
                          Up to{' '}
                          <span className="font-medium">
                            {AMEB_GRADES[pianist.ameb_max_grade - 1] || `Grade ${pianist.ameb_max_grade}`}
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <Badge variant="default">No</Badge>
                  )}
                </div>

                {/* HSC */}
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-zinc-700" />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      HSC Experience
                    </h3>
                  </div>
                  {pianist.hsc_experience ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="default">No</Badge>
                  )}
                </div>

                {/* Sight Reading */}
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-zinc-700" />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Sight-Reading
                    </h3>
                  </div>
                  {pianist.sight_reading ? (
                    <div>
                      <Badge variant="info">
                        {pianist.sight_reading}/5
                      </Badge>
                      <p className="text-sm text-zinc-600 mt-2">
                        {SIGHT_READING_LABELS[pianist.sight_reading]}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-400">Not rated</span>
                  )}
                </div>

                {/* Years */}
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-zinc-700" />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Years of Experience
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">
                      {pianist.years_experience || 0}
                    </span>{' '}
                    years
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Samples */}
          {pianist.media_urls && pianist.media_urls.length > 0 && (
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">
                  Media Samples
                </h2>
                <div className="space-y-3">
                  {pianist.media_urls.map((url, index) => (
                    <div key={index} className="p-3 bg-zinc-50 rounded-lg">
                      {url.endsWith('.mp3') || url.endsWith('.wav') ? (
                        <audio controls className="w-full">
                          <source src={url} />
                        </audio>
                      ) : (
                        <video controls className="w-full rounded">
                          <source src={url} />
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                Reviews
                {reviews && reviews.length > 0 && (
                  <span className="text-sm font-normal text-zinc-500 ml-2">
                    ({reviews.length})
                  </span>
                )}
              </h2>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-zinc-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <StarRating rating={review.rating} size={14} />
                        <span className="text-xs text-zinc-400">
                          {new Date(review.created_at).toLocaleDateString('en-AU')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-zinc-600">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No reviews yet. Be the first to book and review!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Right Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Booking CTA */}
            <BookingCTA
              pianistId={pianist.id}
              hourlyRate={pianist.hourly_rate}
              pianistName={pianist.name}
              availability={availability || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}