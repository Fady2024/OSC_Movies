import type { User } from "@/types/auth.types";

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "u1",
    name: "Alex Morgan",
    email: "alex@example.com",
    password: "password123",
    role: "customer",
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "admin1",
    name: "Cinema Admin",
    email: "admin@cinema.com",
    role: "admin",
    createdAt: "2025-12-01T00:00:00Z",
  },
];
