// src/components/ui/Skeleton.jsx
import { cn } from '@/lib/utils';

// Base skeleton block
export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-zinc-200',
        className
      )}
    />
  );
}

// ──────────────────────────────────────────
// Pre-built skeletons for common patterns
// ──────────────────────────────────────────

// Stat card (used in dashboards)
export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

// Booking list item (used in bookings pages)
export function BookingCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// Job list item (used in jobs pages)
export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
        <div className="text-right space-y-2 shrink-0">
          <Skeleton className="h-5 w-16 ml-auto rounded-full" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// Pianist card (used in search page)
export function PianistCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex gap-4">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-1.5 mt-3">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}

// Booking detail page
export function BookingDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32" />

      {/* Status card */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-3"
          >
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing card */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Actions card */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton({ statCount = 3 }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-${statCount} gap-6`}>
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4"
          >
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile edit skeleton
export function ProfileEditSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Fields */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}

        {/* Submit area */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Pianist public profile skeleton
export function PianistProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex gap-6">
              <Skeleton className="w-24 h-24 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-4 mt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Skills */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-zinc-50 rounded-lg space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-11 w-full rounded-md" />
            <div className="space-y-2 pt-4 border-t border-zinc-200">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-5 w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}