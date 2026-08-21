import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Ticket,
  CreditCard,
  Lock,
  CircleCheck,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getShowtimeById } from "@/api/showtimes.api";
import { createPaymentIntent } from "@/api/payments.api";
import { StripeProvider } from "@/components/shared/stripe-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { formatDateLong, formatTime, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fadeInUp, staggerContainer } from "@/components/shared/animations";

const STEPS = ["Showtime", "Seats", "Payment", "Confirmation"];

function PaymentForm({
  bookingId,
  totalAmount,
}: {
  bookingId: string;
  totalAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
***REMOVED***_url: `${window.location.origin}/booking/${bookingId}/confirmation`,
      },
      redirect: "if_required",
    });

    if (error) {
      setPaymentError(error.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
    } else {
      toast.success("Payment successful!");
      navigate(`/booking/${bookingId}/confirmation`, { replace: true });
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="size-4 text-cinema-gold" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Payment Details
          </h3>
        </div>
        <PaymentElement />
      </div>

      <AnimatePresence>
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          >
            <p className="text-sm text-destructive">{paymentError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          type="submit"
          className="w-full gap-2"
          size="lg"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing payment...
            </>
          ) : (
            <>
              <Lock className="size-4" />
              Pay {formatPrice(totalAmount)}
            </>
          )}
        </Button>
      </motion.div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Secured by Stripe
      </div>
    </motion.form>
  );
}

function PaymentFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-12 w-full" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

export function BookingReviewPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedSeats: string[] =
    (location.state as { selectedSeats?: string[] })?.selectedSeats ?? [];

  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    bookingId: string;
  } | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const {
    data: showtime,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["showtime", showtimeId],
    queryFn: () => getShowtimeById(showtimeId!),
    enabled: !!showtimeId,
  });

  useEffect(() => {
    if (selectedSeats.length === 0 && !isLoading && !paymentData) {
      navigate(`/booking/${showtimeId}/seats`, { replace: true });
    }
  }, [selectedSeats.length, isLoading, paymentData, navigate, showtimeId]);

  const GROUP_DISCOUNT_THRESHOLD = 5;
  const GROUP_DISCOUNT_RATE = 0.1;

  const baseAmount = showtime
    ? showtime.ticketPrice * selectedSeats.length
    : 0;
  const groupDiscount =
    selectedSeats.length >= GROUP_DISCOUNT_THRESHOLD
      ? Math.round(baseAmount * GROUP_DISCOUNT_RATE * 100) / 100
      : 0;
  const totalAmount = Math.round((baseAmount - groupDiscount) * 100) / 100;

  const handleInitPayment = async () => {
    if (!showtime || !showtimeId) return;
    setIsCreatingPayment(true);
    try {
      const data = await createPaymentIntent({
        showtimeId,
        selectedSeats,
      });
      setPaymentData(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize payment"
      );
      setIsCreatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !showtime) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const showtimeDate = new Date(showtime.date);
  const [sh, sm] = showtime.startTime.split(":").map(Number);
  showtimeDate.setHours(sh, sm, 0, 0);
  if (showtimeDate <= new Date()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Showtime has passed"
          description="This showtime is no longer available."
          onRetry={() => navigate("/movies")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Steps */}
      <motion.div
        className="mb-6 flex items-center gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {STEPS.map((step, idx) => (
          <motion.div
            key={step}
            variants={fadeInUp}
            className="flex items-center gap-2"
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                idx === 2
                  ? "bg-primary text-primary-foreground"
                  : idx < 2
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px]",
                  idx === 2 ? "bg-primary-foreground/20" : "bg-muted"
                )}
              >
                {idx + 1}
              </span>
              {step}
            </div>
            {idx < STEPS.length - 1 && (
              <div className="h-px w-4 bg-border sm:w-8" />
            )}
          </motion.div>
        ))}
      </motion.div>

      <Link to={`/booking/${showtimeId}/seats`} state={{ selectedSeats }}>
        <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.96 }}>
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5">
            <ArrowLeft className="size-4" />
            Back to seat selection
          </Button>
        </motion.div>
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {paymentData ? "Complete payment" : "Review your booking"}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Movie */}
          <motion.div
            className="flex gap-4 rounded-xl border border-border/60 bg-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.img
              src={showtime.moviePosterUrl}
              alt={showtime.movieTitle}
              className="size-20 rounded-lg object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
            />
            <div>
              <h2 className="font-semibold">{showtime.movieTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {showtime.hallName}
              </p>
            </div>
          </motion.div>

          {/* Showtime details */}
          <motion.div
            className="rounded-xl border border-border/60 bg-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Showtime
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-cinema-gold/70" />
                {formatDateLong(showtime.date)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-cinema-gold/70" />
                {formatTime(showtime.startTime)} – {formatTime(showtime.endTime)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-cinema-gold/70" />
                {showtime.hallName}
              </div>
            </div>
          </motion.div>

          {/* Seats */}
          <motion.div
            className="rounded-xl border border-border/60 bg-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Selected Seats ({selectedSeats.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.sort().map((seat, i) => (
                <motion.div
                  key={seat}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="flex size-10 items-center justify-center rounded-lg bg-cinema-gold/15 font-mono text-sm font-semibold text-cinema-gold"
                >
                  {seat}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Payment form */}
          {paymentData && (
            <StripeProvider clientSecret={paymentData.clientSecret}>
              <PaymentForm
                bookingId={paymentData.bookingId}
                totalAmount={totalAmount}
              />
            </StripeProvider>
          )}

          {isCreatingPayment && <PaymentFormSkeleton />}
        </div>

        {/* Summary panel */}
        <motion.div
          className="lg:sticky lg:top-20 lg:self-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h3 className="mb-4 font-semibold">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket price</span>
                <span>{formatPrice(showtime.ticketPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>× {selectedSeats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span className="font-mono">
                  {selectedSeats.sort().join(", ")}
                </span>
              </div>
              {groupDiscount > 0 && (
                <>
                  <div className="flex justify-between text-emerald-500">
                    <span>Group discount (5+ seats, 10%)</span>
                    <span>-{formatPrice(groupDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(baseAmount)}</span>
                  </div>
                </>
              )}
              <div className="my-3 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {!paymentData && (
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleInitPayment}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Preparing checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {paymentData && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-500">
                <CircleCheck className="size-3" />
                Seats reserved — complete payment below
              </div>
            )}

            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Ticket className="size-3" />
              Secure checkout powered by Stripe
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
