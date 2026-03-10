"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, getStatusVariant } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import Textarea from "@/components/ui/Textarea";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { BookingDetailSkeleton } from "@/components/ui/Skeleton";

export default function PianistBookingDetailPage() {
  const params = useParams();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [client, setClient] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'accept' | 'decline'
  });

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ✅ Save current user ID for self-review check
      setCurrentUserId(user.id);

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      setBooking(bookingData);

      if (bookingData) {
        const { data: clientData } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("id", bookingData.client_id)
          .single();

        setClient(clientData);

        const { data: review } = await supabase
          .from("reviews")
          .select("*")
          .eq("booking_id", bookingId)
          .eq("reviewer_id", user.id)
          .single();

        setExistingReview(review);
      }
    } catch (err) {
      console.error("Error loading booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => setModal({ isOpen: true, type });
  const closeModal = () => setModal({ isOpen: false, type: null });

  const handleModalConfirm = async () => {
    if (modal.type === "accept") await handleAccept();
    else if (modal.type === "decline") await handleDecline();
  };

  const handleAccept = async () => {
    setActionLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      if (booking.availability_id) {
        await supabase
          .from("availability")
          .update({ is_booked: true })
          .eq("id", booking.availability_id);
      }

      setBooking((prev) => ({ ...prev, status: "accepted" }));
      setSuccess("Booking accepted! The client will be notified.");
    } catch (err) {
      setError(err.message || "Failed to accept booking");
    } finally {
      setActionLoading(false);
      closeModal();
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      setBooking((prev) => ({ ...prev, status: "cancelled" }));
      setSuccess("Booking declined.");
    } catch (err) {
      setError(err.message || "Failed to decline booking");
    } finally {
      setActionLoading(false);
      closeModal();
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setError("Please select a rating");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .insert({
          booking_id: bookingId,
          reviewer_id: user.id,
          reviewee_id: client?.user_id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      setExistingReview(review);
      setShowReviewForm(false);
      setSuccess("Review submitted. Thank you!");
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setActionLoading(false);
    }
  };

  const modalConfig = {
    accept: {
      title: "Accept Booking",
      description:
        "Accept this booking request? The client will be notified and the session will be confirmed.",
      confirmLabel: "Yes, Accept",
      variant: "success",
    },
    decline: {
      title: "Decline Booking",
      description:
        "Are you sure you want to decline this booking request? This action cannot be undone.",
      confirmLabel: "Yes, Decline",
      variant: "danger",
    },
  };

  if (loading) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-zinc-500">Booking not found.</p>
      </div>
    );
  }

  const activeModal = modal.type ? modalConfig[modal.type] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ✅ Confirm Modal */}
      {activeModal && (
        <ConfirmModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
          title={activeModal.title}
          description={activeModal.description}
          confirmLabel={activeModal.confirmLabel}
          variant={activeModal.variant}
          loading={actionLoading}
        />
      )}

      <Link
        href="/pianist/bookings"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to bookings
      </Link>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-6">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Booking Status */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-900">Booking Details</h1>
            {/* ✅ Using imported getStatusVariant */}
            <Badge variant={getStatusVariant(booking.status)}>
              {booking.status}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {booking.source === "job_post" ? "Via job post" : "Direct booking"}
            {" · "}ID: {booking.id.slice(0, 8)}
          </p>
        </CardContent>
      </Card>

      {/* ✅ Pending Action — opens modal instead of confirm() */}
      {booking.status === "pending" && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent>
            <h2 className="text-base font-semibold text-yellow-900 mb-2">
              Action Required
            </h2>
            <p className="text-sm text-yellow-800 mb-4">
              A client has requested to book you. Please accept or decline
              within 24 hours.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => openModal("accept")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Booking
              </Button>
              <Button variant="danger" onClick={() => openModal("decline")}>
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            {client && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {client.name}
                  </p>
                  {client.role_type && (
                    <p className="text-xs text-zinc-500 capitalize">
                      {client.role_type}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {booking.exam_type?.toUpperCase()} · {booking.grade}
                </span>
              </div>
              {booking.exam_date && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Calendar className="h-4 w-4" />
                  <span>Exam: {formatDate(booking.exam_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600">
                <Clock className="h-4 w-4" />
                <span>
                  {booking.required_hours} hour
                  {booking.required_hours !== 1 ? "s" : ""}
                </span>
              </div>
              {["accepted", "paid", "completed"].includes(booking.status) &&
                booking.venue_address && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.venue_address}</span>
                  </div>
                )}
              {booking.status === "pending" && (
                <p className="text-xs text-zinc-400 italic">
                  Venue address will be revealed after you accept.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repertoire */}
      {booking.repertoire && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Repertoire</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">
              {booking.repertoire}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {booking.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">
              {booking.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Earnings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">
                {formatCurrency(booking.hourly_rate)} × {booking.required_hours}{" "}
                hr
                {booking.required_hours !== 1 ? "s" : ""}
              </span>
              <span className="text-zinc-900">
                {formatCurrency(booking.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-200">
              <span className="text-zinc-900 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                You receive
              </span>
              <span className="text-green-600">
                {formatCurrency(booking.total_amount)}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            The client pays an additional 10% service fee. Your full rate is
            always protected.
          </p>
        </CardContent>
      </Card>

      {/* Review Section */}
      {booking.status === "completed" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ Self-review check */}
            {client?.user_id === currentUserId ? (
              <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-zinc-400" />
                <p className="text-sm text-zinc-500">
                  You cannot review yourself.
                </p>
              </div>
            ) : existingReview ? (
              <div className="p-4 bg-zinc-50 rounded-lg">
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                  Your Review
                </h3>
                <StarRating rating={existingReview.rating} size={14} />
                {existingReview.comment && (
                  <p className="text-sm text-zinc-600 mt-2">
                    {existingReview.comment}
                  </p>
                )}
              </div>
            ) : showReviewForm ? (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                  Rate your experience with this client
                </h3>
                <StarRating
                  rating={reviewRating}
                  interactive={true}
                  onRate={setReviewRating}
                  size={24}
                  className="mb-3"
                />
                <Textarea
                  placeholder="Share your experience (optional)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleSubmitReview}
                    loading={actionLoading}
                    size="sm"
                  >
                    Submit Review
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowReviewForm(true)} size="sm">
                Leave a Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
