import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import { Toaster } from "@/components/ui/sonner";
import { PublicLayout } from "@/components/layout/public-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute, AdminRoute } from "@/routes/guards";
import { PageTransition } from "@/components/shared/animations";
import { HomePage } from "@/pages/home";
import { MoviesPage } from "@/pages/movies";
import { ShowtimesPage } from "@/pages/showtimes";
import { MovieDetailPage } from "@/pages/movie-detail";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminMoviesPage } from "@/pages/admin/movies";
import { AdminShowtimesPage } from "@/pages/admin/showtimes";
import { MovieFormPage } from "@/pages/admin/movie-form";
import { AdminBookingsPage } from "@/pages/admin/bookings";
import { AdminHealthPage } from "@/pages/admin/health";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminLogsPage } from "@/pages/admin/logs";
import { AdminDeletedMoviesPage } from "@/pages/admin/deleted-movies";
import { ShowtimeFormPage } from "@/pages/admin/showtime-form";
import { MyBookingsPage } from "@/pages/customer/my-bookings";
import { BookingReviewPage } from "@/pages/customer/booking-review";
import { BookingConfirmationPage } from "@/pages/customer/booking-confirmation";
import { BookingDetailPage } from "@/pages/customer/booking-detail";
import { SeatSelectionPage } from "@/pages/customer/seat-selection";
import { ModifyBookingPage } from "@/pages/customer/modify-booking";
import { FavoritesPage } from "@/pages/favorites";
import { NotFoundPage } from "@/pages/not-found";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { RouteProgress } from "@/components/shared/route-progress";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/movies" element={<PageTransition><MoviesPage /></PageTransition>} />
          <Route path="/showtimes" element={<PageTransition><ShowtimesPage /></PageTransition>} />
          <Route path="/movies/:id" element={<PageTransition><MovieDetailPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
          <Route path="/favorites" element={<PageTransition><ProtectedRoute><FavoritesPage /></ProtectedRoute></PageTransition>} />
          <Route path="/my-bookings" element={<PageTransition><ProtectedRoute><MyBookingsPage /></ProtectedRoute></PageTransition>} />
          <Route path="/booking/:showtimeId/seats" element={<PageTransition><ProtectedRoute><SeatSelectionPage /></ProtectedRoute></PageTransition>} />
          <Route path="/booking/:showtimeId/review" element={<PageTransition><ProtectedRoute><BookingReviewPage /></ProtectedRoute></PageTransition>} />
          <Route path="/booking/:bookingId/confirmation" element={<PageTransition><ProtectedRoute><BookingConfirmationPage /></ProtectedRoute></PageTransition>} />
          <Route path="/booking/:id/modify" element={<PageTransition><ProtectedRoute><ModifyBookingPage /></ProtectedRoute></PageTransition>} />
          <Route path="/booking/:id" element={<PageTransition><ProtectedRoute><BookingDetailPage /></ProtectedRoute></PageTransition>} />
        </Route>
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
          <Route path="/admin/movies" element={<PageTransition><AdminMoviesPage /></PageTransition>} />
          <Route path="/admin/movies/new" element={<PageTransition><MovieFormPage /></PageTransition>} />
          <Route path="/admin/movies/:id/edit" element={<PageTransition><MovieFormPage /></PageTransition>} />
          <Route path="/admin/movies/deleted" element={<PageTransition><AdminDeletedMoviesPage /></PageTransition>} />
          <Route path="/admin/showtimes" element={<PageTransition><AdminShowtimesPage /></PageTransition>} />
          <Route path="/admin/showtimes/new" element={<PageTransition><ShowtimeFormPage /></PageTransition>} />
          <Route path="/admin/showtimes/:id/edit" element={<PageTransition><ShowtimeFormPage /></PageTransition>} />
          <Route path="/admin/bookings" element={<PageTransition><AdminBookingsPage /></PageTransition>} />
          <Route path="/admin/users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
          <Route path="/admin/logs" element={<PageTransition><AdminLogsPage /></PageTransition>} />
          <Route path="/admin/health" element={<PageTransition><AdminHealthPage /></PageTransition>} />
        </Route>
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <NotificationProvider>
            <Toaster richColors position="bottom-right" />
            <ErrorBoundary>
              <RouteProgress />
              <AnimatedRoutes />
            </ErrorBoundary>
          </NotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App
