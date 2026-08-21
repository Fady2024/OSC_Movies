import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types/auth.types";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data: res } = await apiClient.post("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  const { user, token } = res.data;
  return {
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt ?? new Date().toISOString(),
    },
    token,
  };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data: res } = await apiClient.post("/auth/register", {
    fullName: payload.name,
    email: payload.email,
    password: payload.password,
  });
  const { user, token } = res.data;
  return {
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt ?? new Date().toISOString(),
    },
    token,
  };
}

export async function getMe(_token: string): Promise<User> {
  const { data: res } = await apiClient.get("/auth/me");
  const u = res.data;
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, newPassword });
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete("/auth/account");
}
