'use client'; // Ensure this is at the very top of your file!

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
// 1. Import useSearchParams to read the URL
import { useSearchParams } from "next/navigation"; 
// 👉 Import dynamic for our map
import dynamic from "next/dynamic"; 
import Card, { CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { JobCardSkeleton } from "@/components/ui/Skeleton";

// 👉 Dynamically import the map, turning off Server-Side Rendering (ssr: false)
// This is critical because Leaflet requires the browser 'window' to work
const JobsMap = dynamic(() => import("@/components/jobs/JobsMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-zinc-100 animate-pulse rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400">
      Loading Interactive Map...
    </div>
  )
});

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Initialize search params to get the postcode from the URL
  const searchParams = useSearchParams();
  const postcodeQuery = searchParams.get("postcode");

  const supabase = createClient();

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true); // Ensure loading state shows when searching
      try {
        // 3. Start building the base query
        let query = supabase
          .from("job_posts")
          .select("*")
          .eq("status", "open");

        // 4. ✅ Exact match filter: If a postcode exists in the URL, filter by it!
        if (postcodeQuery) {
          query = query.eq("location_postcode", postcodeQuery);
        }

        // 5. Add the ordering and execute the query
        const { data, error } = await query.order("created_at", { ascending: false });
        
        if (error) throw error;

        setJobs(data || []);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [postcodeQuery]); // 6. Add postcodeQuery to dependencies so it refetches when the URL changes

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-7 w-56 bg-zinc-200 animate-pulse rounded-md" />
          <div className="h-4 w-72 bg-zinc-200 animate-pulse rounded-md" />
        </div>
        <div className="space-y-4 max-w-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    // 👉 Widened to max-w-7xl to fit the side-by-side layout
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Open Accompaniment Jobs
          {/* Optional UI enhancement: show the user what they searched for! */}
          {postcodeQuery && <span className="text-blue-600"> in {postcodeQuery}</span>}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Browse current requests from students and teachers in Sydney.
        </p>
      </div>

      {/* 👉 Create a grid: Map on the right (desktop) / top (mobile), Jobs list on the left */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RIGHT COLUMN: The Interactive Map */}
        <div className="order-1 lg:order-2">
           {/* 'sticky top-24' keeps the map on screen while scrolling down the job list! */}
           <div className="sticky top-24">
             <JobsMap jobs={jobs} />
           </div>
        </div>

        {/* LEFT COLUMN: The Job List */}
        <div className="order-2 lg:order-1">
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
                                Exam:{" "}
                                {new Date(job.exam_date).toLocaleDateString(
                                  "en-AU",
                                )}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {job.required_hours} hour
                              {job.required_hours !== 1 ? "s" : ""}
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
              <p className="text-zinc-500 mb-2">No open jobs found{postcodeQuery ? ` for ${postcodeQuery}` : ' at the moment'}.</p>
              <p className="text-sm text-zinc-400">
                Check back soon — new requests are posted regularly.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}