<div align="center">

# 🎬 OSC_Movies — API

### _RESTful Backend for Cinema Ticket Booking_

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-22-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

A production-ready backend API for movie ticket booking with JWT authentication,
role-based access, Stripe payments, seat concurrency, and Swagger documentation.

[![Made with](https://img.shields.io/badge/Made_with-Egypt-E74C3C?style=for-the-badge)](https://github.com/Fady2024)

---

</div>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication & Authorization](#authentication--authorization)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Stripe Integration](#stripe-integration)
- [Middleware](#middleware)
- [Database](#database)
- [Seed Data](#seed-data)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [License](#license)

---

## Features

### Security

- **JWT Authentication** — Stateless token-based auth with role claims
- **Role-Based Access** — Admin and customer role separation
- **Password Hashing** — bcrypt with configurable salt rounds
- **CORS Configuration** — Whitelisted origins
- **Helmet Headers** — Security-focused HTTP headers
- **Input Validation** — Zod schemas for all endpoints

### Payments

- **Stripe Integration** — PaymentIntent-based payment flow
- **Webhook Handling** — Secure webhook verification with Stripe CLI
- **Payment Status Tracking** — Full payment lifecycle management

### Booking System

- **Seat Concurrency** — MongoDB transactions prevent double-booking
- **Real-Time Availability** — Accurate seat status
- **Booking States** — pending → confirmed → completed/cancelled

### Favorites

- **Personal Movie Lists** — Authenticated users can save and remove movies from a personal favorites list
- **Duplicate Protection** — A movie can be favorited only once per user
- **Paginated Retrieval** — Favorites can be retrieved in pages for a responsive library view

### Ratings & Reviews

- **Attendance-Gated Reviews** — Customers can review a movie only after attending a screening (confirmed booking on a showtime that already started); `403 NOT_ATTENDED` otherwise
- **One Review Per User** — A unique `(movie, customer)` index enforces a single review; duplicates return `409 ALREADY_REVIEWED`
- **Editable Reviews** — Customers can update (`PATCH /reviews/:id`) or delete their own review
- **Rating Distribution** — `GET /movies/:id/reviews` returns the average rating plus a per-value (1–10) count distribution alongside paginated comments
- **Review Request Notifications** — A scheduled job sends a one-time `review_request` notification prompting customers to rate movies they attended (skipped once notified or once reviewed)
- **Admin Moderation** — `GET /admin/reviews` (search/rating/paginated) and `DELETE /admin/reviews/:id` for review management; reviews are hidden while the movie is soft-deleted

### Real-Time (Socket.IO)

- **Live Seat Availability** — `showtime:seats` broadcasts any booking/cancellation/payment change to every client viewing that showtime
- **Live Admin Alerts** — `booking:new` / `booking:cancelled` are pushed instantly to all connected admins
- **Push Notifications** — `notification:new` delivers persisted notifications (new movies, low-seat alerts) to subscribed customers over the socket

### Admin Management

- **User Administration** — Paginated user list with search, role filter, and per-user booking statistics
- **Role Editing** — Change any user's role between `customer` and `admin` (self-role change is rejected)
- **Log Viewer API** — `GET /admin/logs` queries Elasticsearch for structured request/error logs

### Documentation

- **Swagger/OpenAPI** — Auto-generated API docs at `/api/docs`
- **Request Validation** — Auto-documented Zod schemas

### Observability

- **Structured Request Logs** — Requests and unhandled errors are emitted as JSON with request IDs, status, path, and duration
- **Elasticsearch Integration** — Set `ELASTICSEARCH_ENABLED=true` and `ELASTICSEARCH_NODE` to index logs into daily `cinema-api-logs-*` indices
- **Kibana Ready** — The Docker Compose stack includes Kibana for searching and visualizing API logs
- **Admin Log API** — `GET /admin/logs` exposes the same indices (with level + text search and pagination) to the admin panel
- **Client Compatibility** — Use `@elastic/elasticsearch` v8.x to match the Elasticsearch 8.x server in the Docker stack (the v9 client sends an incompatible `compatible-with` header)

---

## Tech Stack

| Category          | Technology     | Version       |
| ----------------- | -------------- | ------------- |
| **Runtime**       | Node.js        | 22.x          |
| **Framework**     | Express        | 4.21.2        |
| **Language**      | TypeScript     | 5.7.3         |
| **Database**      | MongoDB        | 8.x (Atlas)   |
| **ODM**           | Mongoose       | 8.12.1        |
| **Auth**          | JSON Web Token | 9.0.2         |
| **Password**      | bcrypt         | 5.1.1         |
| **Payments**      | Stripe         | 22.5.0        |
| **Validation**    | Zod            | 3.24.2        |
| **Documentation** | Swagger        | 6.2.8 / 5.0.1 |
| **Security**      | Helmet         | 8.0.0         |
| **Logging**       | Morgan         | 1.10.0        |
| **Real-Time**     | Socket.IO      | 4.8.3         |
| **Dev Runner**    | tsx            | 4.19.3        |

---

## Project Structure

```
backend/
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
│
└── src/
    ├── server.ts             # Entry point
    ├── app.ts                # Express app setup & middleware
    ├── seed.ts               # Database seeder
    │
    ├── config/               # Configuration modules
    │   ├── database.ts       # MongoDB connection manager
    │   ├── env.ts            # Environment variable loader
    │   ├── stripe.ts         # Stripe SDK singleton
    │   └── swagger.ts        # Swagger documentation setup
    │
    ├── common/               # Shared utilities
    │   ├── errors/
    │   │   └── AppError.ts   # Custom error class
    │   ├── middleware/
    │   │   ├── index.ts              # Barrel exports
    │   │   ├── asyncHandler.ts       # Async error wrapper
    │   │   ├── auth.middleware.ts     # JWT verification
    │   │   ├── error.middleware.ts    # Global error handler
    │   │   ├── role.middleware.ts     # Role-based access
    │   │   └── validation.middleware.ts   # Zod request validation
    │   └── types/
    │       ├── index.ts              # Barrel exports
    │       ├── auth.types.ts         # AuthPayload interface
    │       ├── pagination.types.ts   # PaginatedResponse<T>
    │       ├── booking.types.ts      # BookingStatus, BookingFilter
    │       └── admin.types.ts        # DashboardStats
    │
    └── modules/              # Feature modules (DDD-inspired)
        ├── health/
        │   ├── health.controller.ts
        │   └── health.routes.ts
        │
        ├── auth/
        │   ├── auth.controller.ts
        │   ├── auth.routes.ts
        │   ├── auth.service.ts
        │   ├── auth.types.ts
        │   └── auth.validation.ts
        │
        ├── users/
        │   └── user.model.ts
        │
        ├── movies/
        │   ├── movie.controller.ts
        │   ├── movie.model.ts
        │   ├── movie.routes.ts
        │   ├── movie.service.ts
        │   ├── movie.types.ts
        │   └── movie.validation.ts
        │
        ├── showtimes/
        │   ├── showtime.controller.ts
        │   ├── showtime.model.ts
        │   ├── showtime.routes.ts
        │   ├── showtime.service.ts
        │   ├── showtime.types.ts
        │   └── showtime.validation.ts
        │
        ├── bookings/
        │   ├── booking.controller.ts
        │   ├── booking.model.ts
        │   ├── booking.routes.ts
        │   ├── booking.service.ts
        │   ├── booking.types.ts
        │   ├── booking.validation.ts
        │   └── seat-reservation.model.ts
        │
        ├── payments/
        │   ├── payment.controller.ts
        │   ├── payment.routes.ts
        │   └── payment.service.ts
        │
        └── admin/
            ├── admin.controller.ts
            ├── admin.routes.ts
            └── admin.service.ts
```

### Module Architecture

Each module follows a consistent layered architecture:

```
┌──────────────────────────────────────────────┐
│                 Routes                       │
│         (Express router + guards)            │
├──────────────────────────────────────────────┤
│               Controller                     │
│      (Request parsing & response)            │
├──────────────────────────────────────────────┤
│               Service                        │
│        (Business logic)                      │
├──────────────────────────────────────────────┤
│                Model                         │
│      (Mongoose schema & methods)             │
├──────────────────────────────────────────────┤
│              Database                        │
│         (MongoDB Atlas)                      │
└──────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB Atlas** account (or local MongoDB)
- **Stripe** account (test mode)
- **Stripe CLI** installed (for webhook forwarding)

### Installation

```bash
git clone https://github.com/Fady2024/OSC_Movies.git
cd OSC_Movies/backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cinema
JWT_SECRET=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
CLIENT_URL=http://localhost:5173
```

### Seed Database

```bash
npm run seed
```

### Run Development Server

```bash
npm run dev
```

API available at `http://localhost:5000`

### Available Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript         |
| `npm start`     | Run compiled production build            |
| `npm run seed`  | Seed database with sample data           |
| `npm run lint`  | TypeScript type checking                 |

---

## Authentication & Authorization

### Login Flow

```
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  Client  │ ──────────────────────────────▶│  Server  │
│          │◀──────────────────────────────│          │
│          │     { token, user }            │          │
└──────────┘                                └──────────┘
     │
     │  Store token in localStorage
     │  Attach Bearer token to all requests
     ▼
┌──────────┐     GET /api/movies           ┌──────────┐
│  Client  │ ──── Authorization: Bearer ──▶│  Server  │
│          │◀─────── 200 OK ──────────────│          │
└──────────┘                                └──────────┘
```

### JWT Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Role-Based Access

| Role         | Permissions                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| **customer** | Browse movies, book tickets, manage own bookings                             |
| **admin**    | All customer permissions + manage movies, showtimes, all bookings, dashboard |

### Protected Routes

```typescript
// Admin-only route
router.get("/admin/dashboard", authenticate, authorize("admin"), handler);

// Authenticated route
router.post("/bookings", authenticate, handler);

// Public route
router.get("/movies", handler);
```

---

## API Documentation

### Swagger UI

Once the server is running, visit:

```
http://localhost:5000/api/docs
```

### Live API

The API is deployed on Railway:

```
https://oscmovies-production.up.railway.app/api/docs
```

### API Base URL

```
http://localhost:5000/api
```

**Production:**

```
https://oscmovies-production.up.railway.app/api
```

### Endpoints Overview

#### Health

| Method | Endpoint                   | Auth | Description                                                                               |
| ------ | -------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `GET`  | `/health` or `/api/health` | No   | Service readiness check for the API, MongoDB, Elasticsearch, Kibana, and the web frontend |

Returns `200 OK` when every configured service is healthy, or `503 Service Unavailable` when any is down:

```json
{
  "status": "ok",
  "timestamp": "2026-08-18T12:00:00.000Z",
  "uptime": 3600,
  "services": [
    { "name": "api", "status": "ok", "latencyMs": 0 },
    { "name": "database", "status": "ok", "latencyMs": 2 },
    { "name": "elasticsearch", "status": "ok", "latencyMs": 3 },
    { "name": "kibana", "status": "ok", "latencyMs": 4 },
    { "name": "web", "status": "ok", "latencyMs": 5 }
  ]
}
```

Services without a configured URL (e.g. `KIBANA_URL`, `WEB_URL` not set) are reported as `disabled`.

#### Authentication

| Method | Endpoint         | Auth | Description       |
| ------ | ---------------- | ---- | ----------------- |
| `POST` | `/auth/register` | No   | Register new user |
| `POST` | `/auth/login`    | No   | Login and get JWT |

#### Movies

| Method   | Endpoint      | Auth  | Description                 |
| -------- | ------------- | ----- | --------------------------- |
| `GET`    | `/movies`     | No    | List all movies (paginated) |
| `GET`    | `/movies/:id` | No    | Get movie details           |
| `POST`   | `/movies`     | Admin | Create new movie            |
| `PUT`    | `/movies/:id` | Admin | Update movie                |
| `DELETE` | `/movies/:id` | Admin | Delete movie                |

#### Showtimes

| Method   | Endpoint               | Auth  | Description               |
| -------- | ---------------------- | ----- | ------------------------- |
| `GET`    | `/showtimes`           | No    | List showtimes (filtered) |
| `GET`    | `/showtimes/:id`       | No    | Get showtime details      |
| `GET`    | `/showtimes/:id/seats` | No    | Get available seats       |
| `POST`   | `/showtimes`           | Admin | Create showtime           |
| `PUT`    | `/showtimes/:id`       | Admin | Update showtime           |
| `DELETE` | `/showtimes/:id`       | Admin | Delete showtime           |

#### Bookings

| Method  | Endpoint               | Auth     | Description                                |
| ------- | ---------------------- | -------- | ------------------------------------------ |
| `POST`  | `/bookings`            | Customer | Create booking                             |
| `GET`   | `/bookings/my`         | Customer | Get user's bookings                        |
| `GET`   | `/bookings/:id`        | Owner    | Get booking details                        |
| `PATCH` | `/bookings/:id/seats`  | Owner    | Change seats while preserving ticket count |
| `PATCH` | `/bookings/:id/cancel` | Owner    | Cancel booking                             |

#### Favorites

| Method   | Endpoint                    | Auth     | Description                                 |
| -------- | --------------------------- | -------- | ------------------------------------------- |
| `GET`    | `/favorites`                | Customer | Get the user's paginated favorite movies    |
| `POST`   | `/favorites`                | Customer | Add a movie to favorites                    |
| `DELETE` | `/favorites/:id`            | Customer | Remove a favorite by its favorite record ID |
| `GET`    | `/favorites/check/:movieId` | Customer | Check whether a movie is favorited          |

#### Reviews

| Method   | Endpoint                 | Auth     | Description                                         |
| -------- | ------------------------ | -------- | --------------------------------------------------- |
| `GET`    | `/movies/:id/reviews`    | No       | List reviews with average rating + distribution     |
| `POST`   | `/movies/:id/reviews`    | Customer | Create a review (attendance required, one per user) |
| `GET`    | `/movies/:id/reviews/me` | Customer | Get the user's review + eligibility flags           |
| `PATCH`  | `/reviews/:id`           | Owner    | Update the user's own review                        |
| `DELETE` | `/reviews/:id`           | Owner    | Delete the user's own review                        |

#### Payments

| Method | Endpoint                  | Auth     | Description                 |
| ------ | ------------------------- | -------- | --------------------------- |
| `POST` | `/payments/create-intent` | Customer | Create Stripe PaymentIntent |
| `POST` | `/payments/webhook`       | Stripe   | Stripe webhook handler      |
| `GET`  | `/payments/:id/status`    | Customer | Get payment status          |

#### Admin

| Method   | Endpoint                     | Auth  | Description                                                         |
| -------- | ---------------------------- | ----- | ------------------------------------------------------------------- |
| `GET`    | `/admin/stats`               | Admin | Get dashboard stats                                                 |
| `GET`    | `/admin/bookings`            | Admin | List all bookings (filtered)                                        |
| `PATCH`  | `/admin/bookings/:id/status` | Admin | Update booking status                                               |
| `GET`    | `/admin/users`               | Admin | List all users (search, role filter, paginated, with booking stats) |
| `PATCH`  | `/admin/users/:id/role`      | Admin | Change a user's role (`customer` \| `admin`); self-change rejected  |
| `GET`    | `/admin/logs`                | Admin | Search Elasticsearch API logs (`level`, `search`, paginated)        |
| `GET`    | `/admin/reviews`             | Admin | List all reviews (search, rating filter, paginated)                 |
| `DELETE` | `/admin/reviews/:id`         | Admin | Delete any review (moderation)                                      |

---

## Modules

### Auth Module

Handles user registration and login.

```typescript
POST /api/auth/register
Body: { name, email, password }
Response: { token, user: { id, name, email, role } }

POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, name, email, role } }
```

### Movie Module

Full CRUD for movie management with `toJSON` transform (`_id` to `id`).

```typescript
// Movie Schema
{
  _id: ObjectId,
  title: String,
  description: String,
  genre: String,
  director: String,
  duration: Number,
  rating: Number,
  releaseDate: Date,
  posterUrl: String,
  trailerUrl: String,
  status: "now_showing" | "coming_soon"
}
```

### Showtime Module

Manages movie showtimes with seat configuration.

```typescript
// Showtime Schema
{
  _id: ObjectId,
  movie: ObjectId (ref Movie),
  date: Date,
  time: String,
  hall: String,
  rows: [{
    rowLabel: String,
    seats: [{
      seatNumber: Number,
      type: "standard" | "vip",
      price: Number
    }]
  }],
  totalSeats: Number,
  availableSeats: Number
}
```

### Booking Module

Handles ticket booking with seat reservation.

```typescript
// Booking Schema
{
  _id: ObjectId,
  user: ObjectId (ref User),
  showtime: ObjectId (ref Showtime),
  movie: ObjectId (ref Movie),
  seats: [Number],
  totalAmount: Number,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  paymentIntentId: String,
  paymentStatus: "unpaid" | "paid" | "refunded",
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Seat Reservation Module

Prevents double-booking with unique index.

```typescript
// SeatReservation Schema
{
  _id: ObjectId,
  showtime: ObjectId,
  seatNumber: Number,
  user: ObjectId,
  expiresAt: Date  // TTL index auto-cleans
}
// Unique index: { showtime, seatNumber }
```

### Payment Module

Stripe PaymentIntent integration.

```typescript
POST /api/payments/create-intent
Body: { bookingId }
Response: { clientSecret, bookingId }

POST /api/payments/webhook
Body: Stripe event (raw body)
Effect: Confirms booking, updates payment status
```

### Admin Module

Dashboard statistics and management operations.

```typescript
// Dashboard Stats
{
  totalMovies: Number,
  activeShowtimes: Number,
  todaysBookings: Number,
  totalRevenue: Number,
  occupancyRate: Number
}
```

---

## Real-Time Events (Socket.IO)

Socket.IO is mounted on the same HTTP server (`socket/io.ts`) and authenticates sockets from the JWT provided in the `token` field of the Socket.IO handshake. Admins are placed into an `admins` room automatically; customers can join per-showtime rooms.

| Client → Server  | Payload          | Purpose                                           |
| ---------------- | ---------------- | ------------------------------------------------- |
| `showtime:join`  | `{ showtimeId }` | Join a showtime room to receive live seat updates |
| `showtime:leave` | `{ showtimeId }` | Leave a showtime room                             |

| Server → Client                     | Payload                                                                                            | Trigger                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `showtime:seats`                    | `getAvailableSeats` shape (`showtimeId`, `totalCapacity`, `bookedSeats`, `availableSeats`, `rows`) | Any booking, cancellation, seat change, or payment event for that showtime |
| `booking:new` / `booking:cancelled` | Populated booking (customer + showtime)                                                            | Sent to the `admins` room                                                  |
| `notification:new`                  | Persisted notification document                                                                    | New-movie creation and low-seat showtime alerts                            |

Low-seat alerts are emitted once per showtime (guarded by `availabilityAlerted`) when booked capacity exceeds `SHOWTIME_LOW_SEATS_THRESHOLD` (0.8), to subscribed customers (`role: "customer"`, `notifyNewMovies: true`).

---

## Stripe Integration

### Payment Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Create      │───▶│  Payment     │───▶│  Webhook     │
│  PaymentIntent│   │  Element UI  │    │  Confirm     │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
┌──────────────┐    ┌──────────────┐           │
│  Redirect    │◀───│  Update      │◀──────────┘
│  Confirmation│    │  Booking     │
└──────────────┘    └──────────────┘
```

### Webhook Setup (Local Development)

```bash
# Start Stripe CLI webhook forwarding
stripe listen --forward-to localhost:5000/api/payments/webhook

# This outputs a webhook signing secret (whsec_xxxxx)
# Add it to your .env as STRIPE_WEBHOOK_SECRET
```

### Webhook Events Handled

| Event                           | Action                                 |
| ------------------------------- | -------------------------------------- |
| `payment_intent.succeeded`      | Confirm booking, update payment status |
| `payment_intent.payment_failed` | Mark payment as failed                 |

---

## Middleware

### Global Middleware Stack

Applied in `app.ts` in order:

| Middleware       | Purpose                       |
| ---------------- | ----------------------------- |
| `helmet()`       | Security HTTP headers         |
| `cors()`         | Cross-origin resource sharing |
| `morgan()`       | HTTP request logging          |
| `express.raw()`  | Raw body for Stripe webhooks  |
| `express.json()` | JSON body parsing             |

### Route Middleware

| Middleware           | Purpose                   |
| -------------------- | ------------------------- |
| `authenticate`       | JWT token verification    |
| `authorize("admin")` | Role-based access control |
| `validate(schema)`   | Zod request validation    |

### Validation Middleware

Auto-detects schema type from ZodObject shape:

```typescript
// Schema with "id" key → params validation
const getMovieSchema = z.object({ id: z.string() });

// Schema with body fields → body validation
const createMovieSchema = z.object({ title: z.string(), ... });

// Schema with "page", "limit" keys → query validation
const listMoviesSchema = z.object({ page: z.number(), limit: z.number() });
```

### Error Handling

```typescript
// Custom AppError class
throw new AppError("Movie not found", 404, "MOVIE_NOT_FOUND");

// Error middleware response format
{
  "status": "error",
  "message": "Movie not found",
  "code": "MOVIE_NOT_FOUND"
}
```

---

## Database

### Connection

- **Driver:** Mongoose 8.12.1
- **Database:** MongoDB Atlas (cluster0.ls1cawg.mongodb.net)
- **Connection Manager:** `src/config/database.ts`

### Models

| Model             | Collection       | Indexes                                         |
| ----------------- | ---------------- | ----------------------------------------------- |
| `User`            | users            | email (unique)                                  |
| `Movie`           | movies           | title, genre, status                            |
| `Showtime`        | showtimes        | movie, date, datetime                           |
| `Booking`         | bookings         | user, showtime, status, createdAt               |
| `SeatReservation` | seatreservations | {showtime, seatNumber} unique, TTL on expiresAt |

### Transactions

Seat booking uses MongoDB transactions to prevent double-booking:

```
1. Start session
2. Check seat availability
3. Create seat reservation (unique index prevents duplicates)
4. Create booking
5. Commit transaction
6. (On error) Abort transaction, release seats
```

### toJSON Transform

All models with `_id` apply a `toJSON` transform:

```typescript
schema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
```

---

## Seed Data

### Running the Seeder

```bash
npm run seed
```

### Seed Data Includes

- 8+ movies across multiple genres (Action, Sci-Fi, Drama, Comedy, Animation, Horror, Thriller, Adventure)
- Showtimes for each movie with multiple halls
- Seat configurations (standard + VIP rows)
- Realistic movie data with descriptions, ratings, and durations

---

## Development

### Project Conventions

| Convention       | Standard                                                             |
| ---------------- | -------------------------------------------------------------------- |
| **Architecture** | Module-based with Controller/Service/Model layers                    |
| **Naming**       | camelCase for variables, PascalCase for classes                      |
| **Files**        | kebab-case for file names                                            |
| **Exports**      | Named exports, barrel files for modules                              |
| **Validation**   | Zod schemas in `*.validation.ts` files                               |
| **Types**        | Shared types in `common/types/`, module types in `module/*.types.ts` |
| **Errors**       | Custom `AppError` class with status codes                            |

### File Naming Convention

```
module/
├── module.controller.ts    → Request handlers
├── module.routes.ts        → Express router
├── module.service.ts       → Business logic
├── module.model.ts         → Mongoose schema
├── module.types.ts         → TypeScript types
└── module.validation.ts    → Zod schemas
```

### Adding a New Module

1. Create `src/modules/<module>/` directory
2. Add `model.ts` — Mongoose schema
3. Add `types.ts` — TypeScript interfaces
4. Add `validation.ts` — Zod schemas
5. Add `service.ts` — Business logic
6. Add `controller.ts` — Request handlers
7. Add `routes.ts` — Express router
8. Register routes in `app.ts`

---

## Build & Deploy

### Production Build

```bash
npm run build
```

Output goes to `dist/` directory.

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

| Variable                | Description               | Required |
| ----------------------- | ------------------------- | -------- |
| `PORT`                  | Server port               | Yes      |
| `NODE_ENV`              | Environment (production)  | Yes      |
| `MONGODB_URI`           | MongoDB connection string | Yes      |
| `JWT_SECRET`            | JWT signing secret        | Yes      |
| `STRIPE_SECRET_KEY`     | Stripe secret key         | Yes      |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret     | Yes      |
| `CLIENT_URL`            | Frontend URL for CORS     | Yes      |

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up Stripe webhook endpoint in dashboard
- [ ] Enable CORS for production domain
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (nginx)

---

## License

This project is licensed under the **MIT License**.
