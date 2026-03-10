"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Plus, Trash2, Calendar } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pianistId, setPianistId] = useState(null);

  // New slot form
  const [newSlot, setNewSlot] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });

  const supabase = createClient();

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get pianist profile ID
      const { data: profile } = await supabase
        .from("pianist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setPianistId(profile.id);

        // Get future availability
        const today = new Date().toISOString().split("T")[0];
        const { data: availability } = await supabase
          .from("availability")
          .select("*")
          .eq("pianist_id", profile.id)
          .gte("date", today)
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });

        setSlots(availability || []);
      }
    } catch (err) {
      console.error("Error loading availability:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      setError("Please fill in all fields");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (newSlot.date < today) {
      setError("Cannot add availability in the past");
      return;
    }

    if (newSlot.start_time >= newSlot.end_time) {
      setError("End time must be after start time");
      return;
    }

    setSaving(true);

    try {
      const { data, error: insertError } = await supabase
        .from("availability")
        .insert({
          pianist_id: pianistId,
          date: newSlot.date,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSlots((prev) =>
        [...prev, data].sort((a, b) => {
          if (a.date === b.date)
            return a.start_time.localeCompare(b.start_time);
          return a.date.localeCompare(b.date);
        }),
      );

      setNewSlot({ date: "", start_time: "", end_time: "" });
      setSuccess("Availability slot added");
    } catch (err) {
      setError(err.message || "Failed to add slot");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      const { error: deleteError } = await supabase
        .from("availability")
        .delete()
        .eq("id", slotId);

      if (deleteError) throw deleteError;

      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      setError(err.message || "Failed to delete slot");
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Add slot card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
        </div>

        {/* Existing slots card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-36" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Manage Availability
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Set when you&apos;re available for accompaniment sessions. Clients
          will see these time slots on your profile.
        </p>
      </div>

      {/* Add New Slot */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Input
              label="Date"
              type="date"
              value={newSlot.date}
              onChange={(e) =>
                setNewSlot((prev) => ({ ...prev, date: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              label="Start Time"
              type="time"
              value={newSlot.start_time}
              onChange={(e) =>
                setNewSlot((prev) => ({ ...prev, start_time: e.target.value }))
              }
            />
            <Input
              label="End Time"
              type="time"
              value={newSlot.end_time}
              onChange={(e) =>
                setNewSlot((prev) => ({ ...prev, end_time: e.target.value }))
              }
            />
            <Button onClick={handleAddSlot} loading={saving}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Availability
          </CardTitle>
          <CardDescription>
            {slots.length} upcoming slot{slots.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSlots).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                    {new Date(date + "T00:00:00").toLocaleDateString("en-AU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2">
                    {dateSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-zinc-900">
                            {slot.start_time.slice(0, 5)} –{" "}
                            {slot.end_time.slice(0, 5)}
                          </span>
                          {slot.is_booked ? (
                            <Badge variant="warning">Booked</Badge>
                          ) : (
                            <Badge variant="success">Available</Badge>
                          )}
                        </div>
                        {!slot.is_booked && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">
                No availability slots set yet.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Add time slots above to let clients know when you&apos;re
                available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
