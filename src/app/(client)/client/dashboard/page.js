'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, PlusCircle, Calendar, ClipboardList } from 'lucide-react';

export default function ClientDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
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
                <p className="text-xl font-bold text-zinc-900">0</p>
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
                <p className="text-xl font-bold text-zinc-900">0</p>
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
                <p className="text-xl font-bold text-zinc-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500 mb-4">
              No upcoming bookings yet.
            </p>
            <Link href="/search">
              <Button variant="secondary" size="sm">
                Find a Pianist
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Posted Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500 mb-4">
              You haven&apos;t posted any jobs yet.
            </p>
            <Link href="/client/post-job">
              <Button variant="secondary" size="sm">
                Post a Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}