<div align="center">

# OSC_Movies — Frontend

### *Your Premium Cinema Experience, Reimagined*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

A modern, feature-rich movie ticket booking frontend built with React 19, TypeScript, and shadcn/ui.
Featuring smooth animations, dark/light theme, Stripe payments, and a fully responsive design.

[![Made with](https://img.shields.io/badge/Made_with-Egypt-E74C3C?style=for-the-badge)](https://github.com/Fady2024)

---

</div>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Integration](#api-integration)
- [UI Components](#ui-components)
- [Pages & Routes](#pages--routes)
- [Stripe Payment Flow](#stripe-payment-flow)
- [Authentication](#authentication)
- [Theme System](#theme-system)
- [Animations](#animations)
- [API Layer](#api-layer)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [License](#license)

---

## Features

### Core Features
- **Movie Catalog** — Browse now showing & coming soon movies with rich details
- **Showtime Selection** — Pick your preferred date and time for any movie
- **Interactive Seat Map** — Visual seat selection with real-time availability
- **Secure Payments** — Stripe integration with PaymentElement UI
- **Booking Management** — View, track, and manage all your bookings
- **Movie Favorites** — Save movies from catalog cards and manage them on a dedicated favorites page
- **Ratings & Reviews** — Rate attended movies (1–10) with a comment from the movie page, with a rating distribution chart, your own review management, and a review-request notification after attending
- **QR Confirmation** — Animated confirmation page with booking details

### User Experience
- **Dark/Light Theme** — Seamless theme switching with system preference detection
- **Smooth Animations** — Framer Motion powered transitions and micro-interactions
- **Responsive Design** — Mobile-first layout that works on all screen sizes
- **Loading States** — Skeleton loaders for every data-fetching scenario
- **Error Handling** — Graceful error states with retry options
- **Toast Notifications** — Non-intrusive feedback for all actions

### Admin Features
- **Dashboard** — Real-time stats with animated counters and charts
- **Movie Management** — CRUD operations for movie catalog
- **Showtime Management** — Create and manage showtimes per movie
- **Booking Overview** — Monitor all bookings with filters and search
- **User Management** — Paginated users table with search, role filter, booking/spend stats, and in-place role switching (customer ↔ admin)
- **System Logs** — Searchable/filterable Elasticsearch log viewer (`/admin/logs`)
- **Live Booking Alerts** — New and cancelled bookings appear instantly via Socket.IO

### Real-Time Features
- **Live Seat Map** — Seats refresh over Socket.IO as other customers book
- **Push Notifications** — Toast notifications for new movies, low-seat alerts, and review requests, plus a persisted notification list with unread badge and type filters
- **Instant Admin Updates** — Booking events and notification counters update without a page reload

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 19.2.4 |
| **Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 7.3.1 |
| **Styling** | Tailwind CSS | 4.2.1 |
| **UI Library** | shadcn/ui | Latest |
| **Components** | Radix UI | 1.4.3 |
| **Animations** | Framer Motion | 13.1.0 |
| **HTTP Client** | Axios | 1.19.0 |
| **Server State** | TanStack React Query | 5.101.4 |
| **Routing** | React Router DOM | 7.18.2 |
| **Forms** | React Hook Form | 7.72.0 |
| **Validation** | Zod | 4.3.6 |
| **Payments** | Stripe.js + React Stripe | 9.13.0 / 6.8.1 |
| **Charts** | Recharts | 3.8.0 |
| **Date Utils** | date-fns | 4.1.0 |
| **Theme** | next-themes | 0.4.6 |
| **Toasts** | Sonner | 2.0.7 |

---

## Project Structure

```
Client/
├── public/                    # Static assets
│   └── filmak-logo.png       # App logo
│
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component with providers
│   ├── index.css             # Global styles & Tailwind config
│   │
│   ├── api/                  # API client layer
│   │   ├── client.ts         # Axios instance & interceptors
│   │   ├── auth.api.ts       # Authentication endpoints
│   │   ├── movies.api.ts     # Movie CRUD operations
│   │   ├── showtimes.api.ts  # Showtime & seat endpoints
│   │   ├── bookings.api.ts   # Booking management
│   │   ├── payments.api.ts   # Stripe payment endpoints
│   │   ├── favorites.api.ts  # Favorite-movie endpoints
│   │   ├── reviews.api.ts    # Movie ratings & reviews endpoints
│   │   ├── notifications.api.ts # Notification & subscription endpoints
│   │   └── admin.api.ts      # Admin users & logs endpoints
│   │
│   ├── types/                # TypeScript definitions
│   │   ├── auth.types.ts     # User, Login, Register types
│   │   ├── movie.types.ts    # Movie, Genre types
│   │   ├── showtime.types.ts # Showtime, Seat types
│   │   ├── booking.types.ts  # Booking, Payment types
│   │   └── notification.types.ts # Notification types
│   │
│   ├── pages/                # Route components
│   │   ├── home.tsx          # Landing page
│   │   ├── movies.tsx        # Movie catalog
│   │   ├── movie-detail.tsx  # Single movie view
│   │   ├── auth/             # Auth pages
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── customer/         # Customer features
│   │   │   ├── seat-selection.tsx
│   │   │   ├── booking-review.tsx
│   │   │   ├── booking-confirmation.tsx
│   │   │   ├── booking-detail.tsx
│   │   │   └── my-bookings.tsx
│   │   └── admin/            # Admin panel
│   │       ├── dashboard.tsx
│   │       ├── movies.tsx
│   │       ├── movie-form.tsx
│   │       ├── showtimes.tsx
│   │       ├── showtime-form.tsx
│   │       ├── bookings.tsx
│   │       ├── users.tsx
│   │       ├── logs.tsx
│   │       └── health.tsx
│   │
│   ├── components/           # Reusable components
│   │   ├── layout/           # Layout wrappers
│   │   │   ├── admin-layout.tsx
│   │   │   ├── public-header.tsx
│   │   │   └── public-layout.tsx
│   │   ├── shared/           # Custom components
│   │   │   ├── animations.tsx
│   │   │   ├── movie-card.tsx
│   │   │   ├── seat-map.tsx
│   │   │   ├── skeletons.tsx
│   │   │   ├── states.tsx
│   │   │   └── stripe-provider.tsx
│   │   └── ui/               # shadcn/ui (47 components)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── ... (47 total)
│   │       └── tooltip.tsx
│   │
│   ├── context/              # React Context
│   │   ├── auth-context.tsx  # Auth state provider
│   │   └── notification-context.tsx # Socket.IO + notification state provider
│   │
│   ├── routes/               # Route configuration
│   │   └── guards.tsx        # Auth & role guards
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── use-mobile.ts     # Responsive hook
│   │
│   ├── lib/                  # Utilities
│   │   └── utils.ts          # cn() helper
│   │
│   ├── mocks/                # Mock data
│   │   ├── movies.ts
│   │   ├── bookings.ts
│   │   ├── showtimes.ts
│   │   └── users.ts
│   │
│   └── utils/                # Helper functions
│       └── format.ts         # Date/number formatters
│
├── .env                      # Environment variables
├── .env.example              # Environment template
├── components.json           # shadcn/ui config
├── index.html                # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── vite.config.ts            # Vite configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **Backend API** running on `http://localhost:5000`

### Installation

```bash
# Clone the repository
git clone https://github.com/Fady2024/OSC_Movies.git

# Navigate to frontend directory
cd OSC_Movies/Client

# Install dependencies
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Configure your `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Stripe Publishable Key (test mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

---

## API Integration

All API calls go through a centralized Axios client with automatic auth token injection and error handling.

### Base Configuration

```typescript
// Client/src/api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
```

### Interceptors

| Interceptor | Behavior |
|-------------|----------|
| **Request** | Attaches `Bearer <token>` from localStorage |
| **Response (401)** | Clears auth state, redirects to `/login` |

### API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| `auth.api.ts` | login, register | Authentication |
| `movies.api.ts` | getMovies, getMovieById | Movie catalog |
| `showtimes.api.ts` | getShowtimes, getAvailableSeats, getShowtimeById | Showtime management |
| `bookings.api.ts` | createBooking, getMyBookings, updateBookingSeats, cancelBooking | Booking operations |
| `favorites.api.ts` | getFavorites, addFavorite, removeFavorite, isFavorite | Authenticated favorite-movie management |
| `reviews.api.ts` | getMovieReviews, getMyReview, createReview, updateReview, deleteReview | Movie ratings & reviews |
| `notifications.api.ts` | getNotifications, getUnreadCount, updateSubscription, markRead | Notifications & subscription |
| `admin.api.ts` | getAdminUsers, updateUserRole, getAdminLogs | Admin user & log management |
| `payments.api.ts` | createPaymentIntent, getPaymentStatus | Stripe payments |

### Data Mapping

The API layer handles field mapping between backend (`_id`) and frontend (`id`):

```typescript
// Backend returns _id, frontend uses id
const movie = {
  id: raw._id,
  title: raw.title,
  posterUrl: raw.posterUrl,
  // ...
};
```

---

## UI Components

### shadcn/ui Components (47)

The project uses [shadcn/ui](https://ui.shadcn.com) — a collection of beautifully designed, accessible, and customizable components built on Radix UI.

<details>
<summary><strong>Click to see all 47 components</strong></summary>

| Component | Description |
|-----------|-------------|
| `Accordion` | Collapsible content sections |
| `Alert` | Status messages and notifications |
| `AlertDialog` | Confirmation dialogs |
| `AspectRatio` | Responsive aspect ratio container |
| `Avatar` | User avatar with fallback |
| `Badge` | Status labels and tags |
| `Breadcrumb` | Navigation hierarchy |
| `Button` | Primary interaction element |
| `ButtonGroup` | Grouped button layouts |
| `Calendar` | Date picker calendar |
| `Card` | Content container with header/footer |
| `Carousel` | Image/content slider |
| `Chart` | Data visualization (Recharts) |
| `Checkbox` | Binary toggle input |
| `Collapsible` | Toggle content visibility |
| `Command` | Command palette / search |
| `ContextMenu` | Right-click menus |
| `Dialog` | Modal overlays |
| `Direction` | RTL/LTR support |
| `Drawer` | Slide-in panels |
| `DropdownMenu` | Action menus |
| `Empty` | Empty state placeholders |
| `Field` | Form field wrapper |
| `Form` | Form management with validation |
| `HoverCard` | Hover preview cards |
| `Input` | Text input fields |
| `InputGroup` | Grouped inputs |
| `InputOTP` | One-time password input |
| `Item` | List item component |
| `Kbd` | Keyboard shortcut display |
| `Label` | Form labels |
| `Menubar` | Application menu bar |
| `NativeSelect` | Native select dropdown |
| `NavigationMenu` | Main navigation |
| `Pagination` | Page navigation |
| `Popover` | Floating content |
| `Progress` | Progress indicators |
| `RadioGroup` | Radio button group |
| `Resizable` | Resizable panels |
| `ScrollArea` | Custom scrollable areas |
| `Select` | Custom select dropdown |
| `Separator` | Visual dividers |
| `Sheet` | Side panels |
| `Sidebar` | Application sidebar |
| `Skeleton` | Loading placeholders |
| `Slider` | Range slider input |
| `Sonner` | Toast notifications |
| `Spinner` | Loading spinners |
| `Switch` | Toggle switches |
| `Table` | Data tables |
| `Tabs` | Tabbed navigation |
| `Textarea` | Multi-line text input |
| `Toggle` | Toggle buttons |
| `ToggleGroup` | Grouped toggles |
| `Tooltip` | Hover tooltips |

</details>

---

## Pages & Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `home.tsx` | Landing page with hero, now showing, coming soon |
| `/movies` | `movies.tsx` | Full movie catalog with filters |
| `/movies/:id` | `movie-detail.tsx` | Movie details with showtime picker |
| `/login` | `login.tsx` | User login form |
| `/register` | `register.tsx` | User registration form |

### Customer Routes (Auth Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/movies/:id/seats/:showtimeId` | `seat-selection.tsx` | Interactive seat selection |
| `/booking/review` | `booking-review.tsx` | Review booking & pay with Stripe |
| `/booking/confirmation/:id` | `booking-confirmation.tsx` | Animated booking confirmation |
| `/booking/:id` | `booking-detail.tsx` | Booking details view |
| `/my-bookings` | `my-bookings.tsx` | User's booking history |
| `/favorites` | `favorites.tsx` | Saved movies with paginated management |
| `/movies/:id` | `movie-detail.tsx` | Movie details, showtimes, and ratings & reviews section |

### Admin Routes (Admin Role Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `dashboard.tsx` | Stats dashboard with charts |
| `/admin/movies` | `movies.tsx` | Movie management list |
| `/admin/movies/new` | `movie-form.tsx` | Create new movie |
| `/admin/movies/:id/edit` | `movie-form.tsx` | Edit existing movie |
| `/admin/showtimes` | `showtimes.tsx` | Showtime management |
| `/admin/showtimes/new` | `showtime-form.tsx` | Create new showtime |
| `/admin/showtimes/:id/edit` | `showtime-form.tsx` | Edit existing showtime |
| `/admin/bookings` | `bookings.tsx` | All bookings with status updates |
| `/admin/users` | `users.tsx` | User list with role editing |
| `/admin/logs` | `logs.tsx` | Elasticsearch log viewer |
| `/admin/health` | `health.tsx` | Service health status |

---

## Stripe Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE PAYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Seat Select │───▶│   Booking    │───▶│   Payment    │      │
│  │              │    │   Review     │    │   Element    │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                                                  │              │
│  ┌──────────────┐    ┌──────────────┐           │              │
│  │  Confirmation│◀───│   Webhook    │◀──────────┘              │
│  │   Success    │    │   Confirm    │                           │
│  └──────────────┘    └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Payment Steps

1. **Select Seats** → User picks seats on the interactive seat map
2. **Review Booking** → Summary with movie, seats, showtime, and total price
3. **Click "Proceed to Payment"** → Creates a Stripe PaymentIntent via backend
4. **Stripe PaymentElement** → User enters card details in Stripe's secure UI
5. **Submit Payment** → Confirms the payment with Stripe
6. **Webhook Confirmation** → Backend webhook confirms payment and booking status
7. **Redirect to Confirmation** → Animated success page with booking details

### Stripe Provider

```typescript
// Client/src/components/shared/stripe-provider.tsx
// Dark cinema-themed Stripe Elements wrapper
<StripeProvider clientSecret={clientSecret}>
  <PaymentElement />
</StripeProvider>
```

---

## Authentication

### Auth Context

The app uses React Context for authentication state management:

```typescript
// Available via useAuth() hook
const { user, token, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

### Token Storage

| Key | Storage | Description |
|-----|---------|-------------|
| `cinema_token` | localStorage | JWT access token |
| `cinema_user` | localStorage | Serialized user object |

### Route Guards

| Guard | Description |
|-------|-------------|
| `AuthGuard` | Redirects unauthenticated users to `/login` |
| `RoleGuard` | Restricts access based on user role (admin/customer) |
| `GuestGuard` | Redirects authenticated users away from auth pages |

### User Roles

| Role | Access |
|------|--------|
| `customer` | Browse movies, book tickets, manage bookings |
| `admin` | Full access including admin dashboard and management |

---

## Theme System

### Supported Themes

| Theme | Description |
|-------|-------------|
| **Dark** | Default cinema-inspired dark theme |
| **Light** | Clean light theme |
| **System** | Follows OS preference |

### Implementation

- Uses `next-themes` for theme management
- Persisted in localStorage
- System preference detection with `prefers-color-scheme`
- Toggle button in the header (`mode-toggle.tsx`)

---

## Animations

### Animation Library

All animations are built with **Framer Motion** and organized in `components/shared/animations.tsx`:

| Animation | Description | Usage |
|-----------|-------------|-------|
| `ScrollReveal` | Fade-in on scroll | Page sections, cards |
| `StaggerContainer` | Staggered children animation | Lists, grids |
| `CountUp` | Animated number counter | Stats, prices |
| `fadeInUp` | Fade-in from bottom | Page transitions |
| `fadeIn` | Simple fade-in | Modal content |
| `scaleIn` | Scale up from small | Buttons, cards |
| `slideInLeft` | Slide from left | Side panels |
| `slideInRight` | Slide from right | Side panels |
| `pulse` | Gentle pulse effect | Loading states |
| `shimmer` | Shimmer loading effect | Skeleton screens |
| `float` | Floating animation | Hero elements |

### Page Transitions

All route transitions use smooth animations:

```tsx
// Smooth page transitions with AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Micro-Interactions

- **Button hover** — Scale up with shadow
- **Card hover** — Lift effect with border glow
- **Seat selection** — Bounce animation on select/deselect
- **Booking confirm** — Checkmark animation
- **Toast appear** — Slide in from right

---

## API Layer

### Architecture

```
┌─────────────────────────────────────────────┐
│                  Pages                      │
│         (useQuery / useMutation)            │
├─────────────────────────────────────────────┤
│              API Functions                  │
│    (movies.api, bookings.api, etc.)         │
├─────────────────────────────────────────────┤
│              Axios Client                   │
│    (interceptors, base config, errors)      │
├─────────────────────────────────────────────┤
│              Backend API                    │
│       http://localhost:5000/api             │
└─────────────────────────────────────────────┘
```

### TanStack Query Integration

Every data-fetching operation uses TanStack Query:

```typescript
// Example: Fetching movies with caching and loading states
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ["movies"],
  queryFn: () => getMovies(),
});
```

### Query Keys

| Key | Module | Description |
|-----|--------|-------------|
| `movies` | Movies | Movie list cache |
| `movie-{id}` | Movies | Single movie cache |
| `showtimes` | Showtimes | Showtime list cache |
| `showtime-{id}` | Showtimes | Single showtime cache |
| `seats-{showtimeId}` | Showtimes | Seat availability cache |
| `my-bookings` | Bookings | User's bookings cache |
| `booking-{id}` | Bookings | Single booking cache |
| `admin-movies` | Admin | Admin movie list |
| `admin-showtimes` | Admin | Admin showtime list |
| `admin-bookings` | Admin | Admin booking list |
| `reviews-{movieId}` | Reviews | Movie review list cache |
| `reviews-me-{movieId}` | Reviews | Current user's review cache |

### Cache Invalidation

```typescript
// After mutations, relevant queries are invalidated
queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
queryClient.invalidateQueries({ queryKey: ["seats", showtimeId] });
```

---

## Development

### Project Conventions

| Convention | Standard |
|------------|----------|
| **Components** | Functional components with hooks |
| **Naming** | PascalCase for components, camelCase for functions |
| **Files** | kebab-case for component files |
| **Types** | TypeScript interfaces over types |
| **Styling** | Tailwind CSS utility classes |
| **State** | React Query for server state, Context for auth state |
| **Forms** | React Hook Form + Zod validation |
| **Imports** | Path aliases with `@/` prefix |

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting (TypeScript only)
npx tsc --noEmit
```

---

## Build & Deploy

### Production Build

```bash
npm run build
```

Output goes to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Environment Variables for Production

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |

---

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">

*Star this repo if you find it useful!*

</div>
