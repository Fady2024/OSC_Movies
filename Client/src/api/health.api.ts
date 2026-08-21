import { apiClient } from "./client";

export type ServiceStatus = "ok" | "down" | "disabled";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  detail?: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  services: ServiceHealth[];
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}