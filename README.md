<div align="center">

# 🎬 OSC_Movies — Frontend

### _Premium Cinema Ticket Booking System_

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-22-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

A full-stack movie ticket booking platform with React frontend,
Express/MongoDB backend, Stripe payments, and real-time seat management.

[![Made with](https://img.shields.io/badge/Made_with-Egypt-E74C3C?style=for-the-badge)](https://github.com/Fady2024)

---

</div>

## Table of Contents

- [Preview](#preview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [License](#license)

---

## Preview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    Home Page      Movies      Seat Selection     Pay  │
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐│
│   │  Hero   │     │ Catalog │     │  Seats  │     │ Stripe  ││
│   │  Banner │     │  Grid   │     │   Map   │     │ Payment ││
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘│
│                                                                 │
│    Login      Dashboard      My Bookings      Done   │
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐│
│   │  Auth   │     │  Stats  │     │ Booking │     │Confirm  ││
│   │  Form   │     │  Charts │     │  List   │     │ Screen  ││
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│                  React 19 + Vite 7                           │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │Components│  │ API Layer│  │  Context  │    │
│  │ (Routes) │  │(shadcn/ui│  │ (Axios + │  │  (Auth)   │    │
│  │          │  │ + custom)│  │  TanStack│  │           │    │
│  │          │  │          │  │  Query)  │  │           │    │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘    │
│                                    │                         │
└────────────────────────────────────┼─────────────────────────┘
                                     │
                              HTTP / REST
                                     │
┌────────────────────────────────────┼─────────────────────────┐
│                        API                                │
│              Express 4 + TypeScript 5.7                    │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Routes  │  │Controllers│  │ Services │  │  Models  │  │
│  │ (Guards) │  │ (Parse)   │  │ (Logic)  │  │(Mongoose)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    MongoDB Atlas                      │  │
│  │   Users │ Movies │ Showtimes │ Bookings │ Reservations│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     Stripe                           │  │
│  │   PaymentIntents │ Webhooks │ Refunds               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/Fady2024/OSC_Movies.git
cd OSC_Movies
```

### 2. Setup API

```bash
cd backend
npm install
cp .env.example .env    # Configure your env vars
npm run seed            # Seed database
npm run dev             # Start on port 5000
```

### 3. Setup Client

```bash
cd ../Client
npm install
cp .env.example .env    # Configure your env vars
npm run dev             # Start on port 5173
```

### 4. Stripe Webhooks (for payments)

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## Project Structure

```
OSC_Movies/
├── Client/               # React Frontend
│   ├── src/
│   │   ├── api/          # API client layer (Axios)
│   │   ├── pages/        # Route components
│   │   ├── components/   # UI components (shadcn/ui)
│   │   ├── context/      # React Context (Auth)
│   │   ├── types/        # TypeScript types
│   │   ├── routes/       # Route guards
│   │   └── utils/        # Helper functions
│   └── README.md         # Frontend documentation
│
├── backend/              # Express Backend
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── common/       # Shared middleware & types
│   │   ├── config/       # Environment & DB config
│   │   └── seed.ts       # Database seeder
│   └── README.md         # Backend documentation
│
└── README.md             # This file (root)
```

---

## Documentation

| Document                              | Description                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **[Client README](Client/README.md)** | Frontend architecture, pages, components, Stripe integration, animations                                                |
| **[API README](backend/README.md)**   | Backend architecture, modules, database schemas, API endpoints, middleware                                              |
---

## Tech Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| **Frontend**   | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, shadcn/ui |
| **State**      | TanStack React Query 5, React Context                       |
| **HTTP**       | Axios with interceptors                                     |
| **Forms**      | React Hook Form + Zod                                       |
| **Payments**   | Stripe.js + React Stripe                                    |
| **Animations** | Framer Motion                                               |
| **Backend**    | Express 4, TypeScript 5.7, Node.js 22                       |
| **Database**   | MongoDB 8 (Atlas) + Mongoose 8                              |
| **Auth**       | JWT + bcrypt                                                |
| **Payments**   | Stripe SDK 22                                               |
| **Validation** | Zod                                                         |
| **Docs**       | Swagger/OpenAPI                                             |

---

## Features

### Customer Features

- Browse movies (Now Showing & Coming Soon)
- View movie details and showtimes
- Interactive seat selection with real-time availability
- Secure Stripe payment checkout
- Booking history and details
- Personal movie favorites — save, remove, and revisit movies
- **Ratings & Reviews** — rate attended movies on a 1–10 scale with a written comment (one review per movie, editable), plus a per-rating distribution chart on the movie page
- Animated confirmation page

### Admin Features

- Dashboard with stats and charts
- Movie CRUD management
- Showtime management
- Booking oversight with status updates
- **User management** — paginated user list with search, role filter, per-user booking stats, and in-place role editing (customer ↔ admin)
- **System logs viewer** — search, filter, and inspect live Elasticsearch API logs (info/warn/error)
- **Review moderation** — browse all reviews (search/rating) and delete any review from the admin panel

### Technical Features

- Dark/Light theme system
- Smooth page transitions (Framer Motion)
- Skeleton loading states
- Role-based route protection
- Responsive mobile-first design
- API validation with Zod
- Swagger API documentation
- Seat concurrency with MongoDB transactions
- **Real-time via Socket.IO** — live seat availability, instant booking events for admins, and push notifications (`showtime_alert`, `new_movie`, `review_request`)

---

---

## Production Infrastructure

Run the complete stack (React, API, MongoDB, Elasticsearch, and Kibana):

```bash
# Ensure backend/.env contains JWT_SECRET, then start the stack
docker compose up --build -d
```

The application is served at `http://localhost`, Kibana at `http://localhost:5601`,
and the API health check is available at `/api/health`. The backend writes structured
request and error logs to daily `cinema-api-logs-*` Elasticsearch indices, which can be
explored in Kibana Discover using the `cinema-api-logs-*` data view, or right from the
**admin panel → Logs** page (`/admin/logs`).

> **Local development note:** seat booking uses MongoDB transactions, which require a
> **replica set**. Point `MONGODB_URI` at a standalone `mongod` running as a single-node
> replica set (e.g. `--replSet rs0`) or use MongoDB Atlas. The Docker Compose stack ships
> its own MongoDB for evaluation but it is a standalone instance, so transactions (and
> therefore bookings) only work against a replica-set connection.

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">

[Frontend Docs](Client/README.md) • [API Docs](backend/README.md)

_Star this repo if you find it useful!_

</div>
