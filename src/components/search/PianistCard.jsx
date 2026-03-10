import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { SIGHT_READING_LABELS } from '@/lib/constants';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { MapPin, Music } from 'lucide-react';

export default function PianistCard({ pianist }) {
  return (
    <Link href={`/pianist/${pianist.id}`}>
      <Card className="hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer h-full">
        <CardContent>
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
              <Music className="h-6 w-6 text-zinc-400" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-zinc-900 truncate">
                  {pianist.name}
                </h3>
                <span className="text-base font-bold text-zinc-900 shrink-0">
                  {formatCurrency(pianist.hourly_rate)}
                  <span className="text-xs font-normal text-zinc-400">/hr</span>
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span>Sydney, {pianist.postcode}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-2">
                <StarRating rating={Math.round(pianist.avg_rating || 0)} size={12} />
                <span className="text-xs text-zinc-500">
                  {pianist.avg_rating
                    ? `${Number(pianist.avg_rating).toFixed(1)} (${pianist.total_reviews})`
                    : 'New'}
                </span>
                <span className="text-xs text-zinc-300 mx-1">·</span>
                <span className="text-xs text-zinc-500">
                  {pianist.years_experience}yr exp
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {pianist.ameb_experience && (
                  <Badge variant="info">AMEB</Badge>
                )}
                {pianist.hsc_experience && (
                  <Badge variant="info">HSC</Badge>
                )}
                {pianist.sight_reading && (
                  <Badge variant="default">
                    Sight-reading: {pianist.sight_reading}/5
                  </Badge>
                )}
                {pianist.is_verified && (
                  <Badge variant="success">Verified</Badge>
                )}
              </div>

              {/* Bio Preview */}
              {pianist.bio && (
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                  {pianist.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}