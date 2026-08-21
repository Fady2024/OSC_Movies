import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Database,
  Search,
  BarChart3,
  Globe,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getHealth, type ServiceStatus, type ServiceHealth } from "@/api/health.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const serviceIcons: Record<string, LucideIcon> = {
  api: Server,
  database: Database,
  elasticsearch: Search,
  kibana: BarChart3,
  web: Globe,
};

export function AdminHealthPage() {
  const { t } = useTranslation();

  const { data, isError, isPending, isFetching, refetch } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: getHealth,
    refetchInterval: 30000,
  });

  const serviceLabels: Record<string, string> = {
    api: t("admin.health.serviceApi"),
    database: t("admin.health.serviceDatabase"),
    elasticsearch: t("admin.health.serviceElasticsearch"),
    kibana: t("admin.health.serviceKibana"),
    web: t("admin.health.serviceWeb"),
  };
  const statusLabels: Record<ServiceStatus, string> = {
    ok: t("admin.health.ok"),
    down: t("admin.health.down"),
    disabled: t("admin.health.disabled"),
  };
  const statusDot: Record<ServiceStatus, string> = {
    ok: "bg-emerald-500",
    down: "bg-red-500",
    disabled: "bg-muted-foreground",
  };
  const statusText: Record<ServiceStatus, string> = {
    ok: "text-emerald-500",
    down: "text-red-500",
    disabled: "text-muted-foreground",
  };

  const overallOk = data?.services.every(
    (s) => s.status === "ok" || s.status === "disabled"
  );
  const overall = isError
    ? "failed"
    : !data
      ? "unknown"
      : overallOk
        ? "ok"
        : "degraded";

  const overallIcon =
    overall === "ok"
      ? ShieldCheck
      : overall === "degraded"
        ? ShieldAlert
        : ShieldX;

  const overallTone =
    overall === "ok"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : overall === "degraded"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400";

  const OverallIcon = overallIcon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.health.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.health.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          {t("admin.health.refresh")}
        </Button>
      </div>

      {/* Overall status banner */}
      <div className={cn("flex items-center gap-4 rounded-xl border p-5", overallTone)}>
        <OverallIcon className="size-8 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {overall === "ok" && t("admin.health.allOperational")}
            {overall === "degraded" && t("admin.health.partialOutage")}
            {overall === "failed" && t("admin.health.checkFailed")}
            {overall === "unknown" && t("admin.health.loading")}
          </p>
          <p className="mt-0.5 text-xs opacity-80">
            {t("admin.health.lastChecked", { time: data ? new Date(data.timestamp).toLocaleTimeString() : "—" })}
            {data && ` · ${t("admin.health.uptime", { seconds: data.uptime })}`}
          </p>
        </div>
      </div>

      {/* Service cards */}
      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("admin.health.checkFailed")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.services.map((service: ServiceHealth) => {
            const Icon = serviceIcons[service.name] ?? Server;
    return (
              <div key={service.name} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-muted-foreground" />
                  <span
                    className={cn("size-2.5 rounded-full", statusDot[service.status])}
                    title={service.detail ?? statusLabels[service.status]}
                  />
                </div>
                <p className="mt-3 text-sm font-medium">
                  {serviceLabels[service.name] ?? service.name}
                </p>
                <div className="mt-1 flex flex-col gap-0.5 text-xs">
                  <span className={cn("font-medium", statusText[service.status])}>
                    {statusLabels[service.status]}
                  </span>
                  {service.status !== "disabled" && (
                    <span className="text-muted-foreground">
                      {t("admin.health.latency", { ms: service.latencyMs })}
                    </span>
                  )}
                  {service.detail && (
                    <span className="truncate text-muted-foreground/70" title={service.detail}>
                      {service.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}