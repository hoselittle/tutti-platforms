// src/app/(pianist)/pianist/dashboard/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import {
  Calendar,
  DollarSign,
  Star,
  Briefcase,
  ArrowRight,
  Clock,
  User,
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

const supabase = createClient();

export default function PianistDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    activeBookings: 0,
    totalEarnings: 0,
    avgRating: null,
    completedBookings: 0,
  });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [pianistProfile, setPianistProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get pianist profile
      const { data: profile } = await supabase
        .from('pianist_profiles')
        .select('id, avg_rating, total_reviews, hourly_rate')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;
      setPianistProfile(profile);

      // 2. Run all queries in parallel for performance
      const [
        activeBookingsRes,
        completedBookingsRes,
        earningsRes,
        pendingBookingsRes,
        openJobsRes,
      ] = await Promise.all([
        // Active bookings count (pending + accepted + paid)
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('pianist_id', profile.id)
          .in('status', ['pending', 'accepted', 'paid']),

        // Completed bookings count
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('pianist_id', profile.id)
          .eq('status', 'completed'),

        // Total earnings from completed bookings
        supabase
          .from('bookings')
          .select('total_amount')
          .eq('pianist_id', profile.id)
          .eq('status', 'completed'),

        // Pending booking requests (need action)
        supabase
          .from('bookings')
          .select(`
            id,
            status,
            exam_type,
            grade,
            required_hours,
            hourly_rate,
            requested_at,
            client_profiles:client_id (
              id,
              name
            )
          `)
          .eq('pianist_id', profile.id)
          .eq('status', 'pending')
          .order('requested_at', { ascending: false })
          .limit(5),

        // Recent open jobs matching pianist's area
        supabase
          .from('job_posts')
          .select('id, title, exam_type, grade, required_hours, location_postcode, created_at, application_count')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      // Calculate total earnings
      const earnings = earningsRes.data || [];
      const totalEarnings = earnings.reduce(
        (sum, b) => sum + (b.total_amount || 0),
        0
      );

      setStats({
        activeBookings: activeBookingsRes.count || 0,
        totalEarnings,
        avgRating: profile.avg_rating,
        completedBookings: completedBookingsRes.count || 0,
      });

      setPendingBookings(pendingBookingsRes.data || []);
      setOpenJobs(openJobsRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }

    // 👉 REALTIME UPDATE LISTENER: 
    // Listen for the custom event fired by our RealtimeNotifications component
    window.addEventListener('refresh-bookings', loadDashboardData);

    // 👉 Always clean up the listener when the component unmounts
    return () => {
      window.removeEventListener('refresh-bookings', loadDashboardData);
    };
  }, [authLoading, user, loadDashboardData]);

  if (authLoading || loading) {
    return <DashboardSkeleton statCount={4} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back! Here&apos;s an overview of your activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/pianist/availability">
            <Button variant="secondary" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Availability
            </Button>
          </Link>
          <Link href="/pianist/jobs">
            <Button size="sm">
              <Briefcase className="mr-2 h-4 w-4" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Active Bookings</p>
                <p className="text-xl font-bold text-zinc-900">
                  {stats.activeBookings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total Earnings</p>
                <p className="text-xl font-bold text-zinc-900">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Rating</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {stats.avgRating ? (
                    <>
                      <p className="text-xl font-bold text-zinc-900">
                        {Number(stats.avgRating).toFixed(1)}
                      </p>
                      <StarRating
                        rating={Math.round(stats.avgRating)}
                        size={14}
                      />
                    </>
                  ) : (
                    <p className="text-xl font-bold text-zinc-400">—</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="text-xl font-bold text-zinc-900">
                  {stats.completedBookings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Requests</CardTitle>
              {pendingBookings.length > 0 && (
                <Link href="/pianist/bookings">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pendingBookings.length > 0 ? (
              <div className="space-y-3">
                {pendingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/pianist/bookings/${booking.id}`}
                  >
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:border-yellow-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {booking.client_profiles?.name || 'Client'}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {booking.exam_type?.toUpperCase()}
                            {booking.grade && ` · ${booking.grade}`}
                            {' · '}{booking.required_hours} hr
                            {booking.required_hours !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900">
                          {formatCurrency(booking.hourly_rate)}/hr
                        </p>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">
                  No pending requests.
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  New booking requests will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Open Jobs</CardTitle>
              <Link href="/pianist/jobs">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {openJobs.length > 0 ? (
              <div className="space-y-3">
                {openJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/pianist/jobs/${job.id}`}
                  >
                    <div className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                          {job.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {job.exam_type?.toUpperCase()}
                          {job.grade && ` · ${job.grade}`}
                          {' · '}{job.required_hours} hr
                          {job.required_hours !== 1 ? 's' : ''}
                          {' · '}{job.location_postcode}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xs text-zinc-400">
                          {job.application_count} applied
                        </p>
                        <Badge variant="success">Open</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Briefcase className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">
                  No open jobs at the moment.
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Check back soon for new requests.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}