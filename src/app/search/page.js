"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SearchFilters from "@/components/search/SearchFilters";
import PianistCard from "@/components/search/PianistCard";
import { PianistCardSkeleton } from "@/components/ui/Skeleton";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [pianists, setPianists] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadPianists();
  }, [searchParams]);

  const loadPianists = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("pianist_profiles")
        .select("*")
        .neq("name", "")
        .order("avg_rating", { ascending: false });

      // Apply filters from URL params
      const postcode = searchParams.get("postcode");
      const ameb = searchParams.get("ameb");
      const hsc = searchParams.get("hsc");
      const minRate = searchParams.get("min_rate");
      const maxRate = searchParams.get("max_rate");
      const minRating = searchParams.get("min_rating");
      const sightReading = searchParams.get("sight_reading");

      if (postcode) {
        query = query.eq("postcode", postcode);
      }
      if (ameb === "true") {
        query = query.eq("ameb_experience", true);
      }
      if (hsc === "true") {
        query = query.eq("hsc_experience", true);
      }
      if (minRate) {
        query = query.gte("hourly_rate", parseFloat(minRate));
      }
      if (maxRate) {
        query = query.lte("hourly_rate", parseFloat(maxRate));
      }
      if (minRating) {
        query = query.gte("avg_rating", parseFloat(minRating));
      }
      if (sightReading) {
        query = query.gte("sight_reading", parseInt(sightReading));
      }

      const { data, error } = await query;

      if (error) throw error;
      setPianists(data || []);
    } catch (err) {
      console.error("Error loading pianists:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build current filters object for the filter component
  const currentFilters = {
    postcode: searchParams.get("postcode") || "",
    ameb: searchParams.get("ameb") || "",
    hsc: searchParams.get("hsc") || "",
    min_rate: searchParams.get("min_rate") || "",
    max_rate: searchParams.get("max_rate") || "",
    min_rating: searchParams.get("min_rating") || "",
    sight_reading: searchParams.get("sight_reading") || "",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Find an Accompanist
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Browse verified pianists available for AMEB and HSC examinations in
          Sydney.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters currentFilters={currentFilters} />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {loading
                ? "Searching..."
                : `${pianists.length} pianist${pianists.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PianistCardSkeleton key={i} />
              ))}
            </div>
          ) : pianists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pianists.map((pianist) => (
                <PianistCard key={pianist.id} pianist={pianist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-zinc-500 mb-2">
                No pianists found matching your criteria.
              </p>
              <p className="text-sm text-zinc-400">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
