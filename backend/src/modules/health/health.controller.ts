import { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "@/config/env";

type ServiceStatus = "ok" | "down" | "disabled";

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  detail?: string;
}

async function pingService(url: string, timeoutMs = 3000) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return {
      ok: res.ok,
      latencyMs: Date.now() - start,
      detail: `${res.status} ${res.statusText}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : "unreachable",
    };
  }
}

export async function getHealth(_req: Request, res: Response) {
  const start = performance.now();
  const services: ServiceHealth[] = [
    { name: "api", status: "ok", latencyMs: 0 },
  ];

  const dbStart = Date.now();
  try {
    await mongoose.connection.db?.command({ ping: 1 });
    services.push({
      name: "database",
      status: "ok",
      latencyMs: Date.now() - dbStart,
    });
  } catch (err) {
    services.push({
      name: "database",
      status: "down",
      latencyMs: Date.now() - dbStart,
      detail: err instanceof Error ? err.message : "disconnected",
    });
  }

  if (env.ELASTICSEARCH_ENABLED) {
    const es = await pingService(`${env.ELASTICSEARCH_NODE}/_cluster/health`);
    services.push({
      name: "elasticsearch",
      status: es.ok ? "ok" : "down",
      latencyMs: es.latencyMs,
      detail: es.detail,
    });
  } else {
    services.push({ name: "elasticsearch", status: "disabled", latencyMs: 0 });
  }

  if (env.KIBANA_URL) {
    const kb = await pingService(`${env.KIBANA_URL}/api/status`);
    services.push({
      name: "kibana",
      status: kb.ok ? "ok" : "down",
      latencyMs: kb.latencyMs,
      detail: kb.detail,
    });
  } else {
    services.push({ name: "kibana", status: "disabled", latencyMs: 0 });
  }

  if (env.WEB_URL) {
    const web = await pingService(`${env.WEB_URL}/`);
    services.push({
      name: "web",
      status: web.ok ? "ok" : "down",
      latencyMs: web.latencyMs,
      detail: web.detail,
    });
  } else {
    services.push({ name: "web", status: "disabled", latencyMs: 0 });
  }

  const allOk = services.every((s) => s.status === "ok" || s.status === "disabled");
  services[0].latencyMs = Math.max(0, Math.round(performance.now() - start));
  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    services,
  });
}
