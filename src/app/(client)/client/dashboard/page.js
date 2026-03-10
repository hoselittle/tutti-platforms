'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import {
  formatCurrency,
  formatDate,
  getStatusVariant,
  getJobStatusVariant,
} from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  Search,
  PlusCircle,
  Calendar,
  ClipboardList,
  ArrowRight,
  Music,
  Users,
} from 'lucide-react';

const supabase = createClient();

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    activeBookings: 0,
    postedJobs: 0,
    completedBookings: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const [
        activeBookingsRes,
        completedBookingsRes,
        postedJobsRes,
        upcomingBookingsRes,
        recentJobsRes,
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', profile.id)
          .in('status', ['pending', 'accepted', 'paid']),

        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', profile.id)
          .eq('status', 'completed'),

        supabase
          .from('job_posts')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', profile.id),

        supabase
          .from('bookings')
          .select(`
            id,
            status,
            exam_type,
            grade,
            required_hours,
            client_pays,
            requested_at,
            pianist_profiles:pianist_id (
              id,
              name,
              avg_rating,
              hourly_rate
            )
          `)
          .eq('client_id', profile.id)
          .in('status', ['pending', 'accepted', 'paid'])
          .order('requested_at', { ascending: false })
          .limit(5),

        supabase
          .from('job_posts')
          .select(
            'id, title, status, exam_type, grade, application_count, created_at'
          )
          .eq('client_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        activeBookings: activeBookingsRes.count || 0,
        postedJobs: postedJobsRes.count || 0,
        completedBookings: completedBookingsRes.count || 0,
      });

      setUpcomingBookings(upcomingBookingsRes.data || []);
      setRecentJobs(recentJobsRes.data || []);
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
  }, [authLoading, user, loadDashboardData]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-center text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Find and book accompanists for your exams.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/search">
            <Button variant="secondary" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Find Pianists
            </Button>
          </Link>
          <Link href="/client/post-job">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
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
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Posted Jobs</p>
                <p className="text-xl font-bold text-zinc-900">
                  {stats.postedJobs}
                </p>
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
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              {upcomingBookings.length > 0 && (
                <Link href="/client/bookings">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/client/bookings/${booking.id}`}
                  >
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
                          <Music className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {booking.pianist_profiles?.name || 'Pianist'}
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
                        {/* ✅ Using imported getStatusVariant */}
                        <Badge variant={getStatusVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-semibold text-zinc-900 mt-1">
                          {formatCurrency(booking.client_pays)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 mb-3">
                  No upcoming bookings yet.
                </p>
                <Link href="/search">
                  <Button variant="secondary" size="sm">
                    Find a Pianist
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Posted Jobs</CardTitle>
              {recentJobs.length > 0 && (
                <Link href="/client/jobs">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/client/jobs/${job.id}`}>
                    <div className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                          <span>{job.exam_type?.toUpperCase()}</span>
                          {job.grade && (
                            <>
                              <span className="text-zinc-300">·</span>
                              <span>{job.grade}</span>
                            </>
                          )}
                          <span className="text-zinc-300">·</span>
                          <Users className="h-3 w-3" />
                          <span>{job.application_count} applied</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {/* ✅ Using imported getJobStatusVariant */}
                        <Badge variant={getJobStatusVariant(job.status)}>
                          {job.status}
                        </Badge>
                        <p className="text-xs text-zinc-400 mt-1">
                          {formatDate(job.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ClipboardList className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 mb-3">
                  No jobs posted yet.
                </p>
                <Link href="/client/post-job">
                  <Button variant="secondary" size="sm">
                    Post a Job
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}