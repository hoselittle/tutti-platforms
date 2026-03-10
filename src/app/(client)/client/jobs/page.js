"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getJobStatusVariant } from "@/lib/utils";
import { PlusCircle, MapPin, Users } from "lucide-react";
import { JobCardSkeleton } from "@/components/ui/Skeleton";

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const { data: jobsData } = await supabase
          .from("job_posts")
          .select("*")
          .eq("client_id", profile.id)
          .order("created_at", { ascending: false });

        setJobs(jobsData || []);
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-7 w-24 bg-zinc-200 animate-pulse rounded-md" />
            <div className="h-4 w-64 bg-zinc-200 animate-pulse rounded-md" />
          </div>
          <div className="h-9 w-28 bg-zinc-200 animate-pulse rounded-md" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Jobs</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your posted jobs and review applications.
          </p>
        </div>
        <Link href="/client/post-job">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/client/jobs/${job.id}`}>
              <Card className="hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer mb-4">
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location_postcode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.application_count} application
                          {job.application_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <Badge variant="info">
                          {job.exam_type?.toUpperCase()}
                        </Badge>
                        {job.grade && (
                          <Badge variant="default">{job.grade}</Badge>
                        )}
                        <Badge variant="default">
                          {job.required_hours} hr
                          {job.required_hours !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {/* ✅ Using imported getJobStatusVariant */}
                      <Badge variant={getJobStatusVariant(job.status)}>
                        {job.status}
                      </Badge>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(job.created_at).toLocaleDateString("en-AU")}
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
          <p className="text-zinc-500 mb-4">
            You haven&apos;t posted any jobs yet.
          </p>
          <Link href="/client/post-job">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
