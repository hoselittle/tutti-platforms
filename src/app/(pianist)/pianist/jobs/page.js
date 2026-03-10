'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';

export default function PianistJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await supabase
          .from('job_posts')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        setJobs(data || []);
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-center text-zinc-500">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Browse Jobs</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Open accompaniment requests from clients in Sydney.
        </p>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/pianist/jobs/${job.id}`}>
              <Card className="hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer mb-4">
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location_postcode}
                        </span>
                        {job.exam_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Exam: {new Date(job.exam_date).toLocaleDateString('en-AU')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.required_hours} hour{job.required_hours !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.application_count} applied
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge variant="info">
                          {job.exam_type?.toUpperCase()}
                        </Badge>
                        {job.grade && (
                          <Badge variant="default">{job.grade}</Badge>
                        )}
                        {job.budget_max && (
                          <Badge variant="default">
                            Up to {formatCurrency(job.budget_max)}/hr
                          </Badge>
                        )}
                      </div>

                      {job.repertoire && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                          {job.repertoire}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-400">
                        {new Date(job.created_at).toLocaleDateString('en-AU')}
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
          <p className="text-zinc-500 mb-2">No open jobs at the moment.</p>
          <p className="text-sm text-zinc-400">
            Check back soon — new requests are posted regularly.
          </p>
        </div>
      )}
    </div>
  );
}