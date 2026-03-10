'use client';

import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Calendar, Shield, Clock } from 'lucide-react';

export default function BookingCTA({
  pianistId,
  hourlyRate,
  pianistName,
  availability,
}) {
  const { isAuthenticated, isClient, loading } = useAuth();

  // Group availability by date
  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const availableDates = Object.keys(groupedAvailability).slice(0, 5);

  return (
    <>
      {/* Pricing Card */}
      <Card>
        <CardContent>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-zinc-900">
              {formatCurrency(hourlyRate)}
            </span>
            <span className="text-sm text-zinc-500"> / hour</span>
          </div>

          <div className="text-center text-xs text-zinc-400 mb-4">
            + 10% service fee
          </div>

          {!loading && (
            <>
              {isAuthenticated && isClient ? (
                <Link href={`/client/book/${pianistId}`}>
                  <Button className="w-full" size="lg">
                    Request Booking
                  </Button>
                </Link>
              ) : isAuthenticated ? (
                <p className="text-sm text-zinc-500 text-center">
                  Only clients can book pianists.
                </p>
              ) : (
                <Link href={`/register?role=client&redirect=/pianist/${pianistId}`}>
                  <Button className="w-full" size="lg">
                    Sign Up to Book
                  </Button>
                </Link>
              )}
            </>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure escrow payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              <span>24-hour response time</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Preview */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Availability
          </h3>

          {availableDates.length > 0 ? (
            <div className="space-y-3">
              {availableDates.map((date) => (
                <div key={date}>
                  <p className="text-xs font-medium text-zinc-700 mb-1">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-AU', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {groupedAvailability[date].map((slot) => (
                      <Badge key={slot.id} variant="default">
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              No availability set yet.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}