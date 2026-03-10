"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Card, { CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency, getStatusVariant } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { BookingCardSkeleton } from "@/components/ui/Skeleton";

export default function PianistBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("pianist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(
            `
            *,
            client_profiles:client_id (
              id,
              name
            )
          `,
          )
          .eq("pianist_id", profile.id)
          .order("requested_at", { ascending: false });

        setBookings(bookingsData || []);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-7 w-36 bg-zinc-200 animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-zinc-200 animate-pulse rounded-md" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">My Bookings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your accompaniment bookings and requests.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/pianist/bookings/${booking.id}`}>
              <Card className="hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer mb-4">
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {booking.client_profiles?.name || "Client"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span>{booking.exam_type?.toUpperCase()}</span>
                          {booking.grade && (
                            <>
                              <span className="text-zinc-300">·</span>
                              <span>{booking.grade}</span>
                            </>
                          )}
                          <span className="text-zinc-300">·</span>
                          <span>
                            {booking.required_hours} hr
                            {booking.required_hours !== 1 ? "s" : ""}
                          </span>
                          <span className="text-zinc-300">·</span>
                          <span>
                            {booking.source === "job_post"
                              ? "Via job"
                              : "Direct"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {/* ✅ Using imported getStatusVariant */}
                      <Badge variant={getStatusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-semibold text-zinc-900 mt-1">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(booking.requested_at).toLocaleDateString(
                          "en-AU",
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 mb-2">No bookings yet.</p>
          <p className="text-sm text-zinc-400">
            Bookings will appear here when clients request your services.
          </p>
        </div>
      )}
    </div>
  );
}
