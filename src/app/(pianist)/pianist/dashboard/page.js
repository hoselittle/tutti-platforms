'use client';

import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Calendar, DollarSign, Star, Briefcase } from 'lucide-react';

export default function PianistDashboard() {
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Welcome back! Here&apos;s an overview of your activity.
        </p>
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
                <p className="text-xl font-bold text-zinc-900">0</p>
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
                <p className="text-xl font-bold text-zinc-900">\$0</p>
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
                <p className="text-xl font-bold text-zinc-900">—</p>
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
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              No pending booking requests.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              No open jobs matching your profile yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}