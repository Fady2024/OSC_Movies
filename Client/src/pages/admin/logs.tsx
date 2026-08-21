import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, Activity, DatabaseZap } from "lucide-react";
import { useState, useEffect } from "react";
import { getAdminLogs } from "@/api/admin.api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LEVEL_CONFIG = (t: (k: string) => string) => ({
  info: { label: t("admin.logs.levelInfo"), className: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30" },
  warn: { label: t("admin.logs.levelWarn"), className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  error: { label: t("admin.logs.levelError"), className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
});

export function AdminLogsPage() {
  const { t } = useTranslation();
  const levelConfig = LEVEL_CONFIG(t);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "logs", { level, search: debouncedSearch, page }],
    queryFn: () =>
      getAdminLogs({
        level: level || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      }),
  });

  const levels = ["", "info", "warn", "error"];

  const formatTimestamp = (iso?: unknown) => {
    if (typeof iso !== "string") return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const summaryLine = (log: Record<string, unknown>) => {
    const parts: string[] = [];
    if (log.method && log.path) parts.push(`${log.method} ${log.path}`);
    if (log.statusCode !== undefined) parts.push(String(log.statusCode));
    if (log.durationMs !== undefined) parts.push(`${log.durationMs}ms`);
    if (log.message) parts.push(String(log.message));
    if (log.userId) parts.push(`user=${log.userId}`);
    if (log.requestId) parts.push(`req=${log.requestId}`);
    return parts.join(" · ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.logs.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.logs.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.logs.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {levels.map((lv) => (
            <button
              key={lv}
              onClick={() => {
                setLevel(lv);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                level === lv
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {lv === "" ? t("admin.logs.all") : lv}
            </button>
          ))}
        </div>
      </div>

      {data && !data.enabled && !isLoading ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-10 text-center">
          <DatabaseZap className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">{t("admin.logs.disabled")}</p>
          <p className="max-w-md text-xs text-muted-foreground">{t("admin.logs.disabledDesc")}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data?.data ?? []).length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-6" />}
          title={t("admin.logs.empty")}
          description={t("admin.logs.emptyDesc")}
        />
      ) : (
        <div className="space-y-2">
          {(data?.data ?? []).map((entry) => {
            const { id, "@timestamp": ts, level: lv, event, ...rest } = entry as Record<string, unknown>;
            const cfg = levelConfig[lv as keyof typeof levelConfig];
    ***REMOVED*** (
              <details key={String(id)} className="group rounded-xl border border-border/60 bg-card">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <Badge variant="outline" className={cn("shrink-0 font-mono text-[10px] uppercase", cfg?.className)}>
                    {String(lv ?? "log")}
                  </Badge>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatTimestamp(ts)}</span>
                  <span className="flex min-w-0 items-center gap-1 text-sm font-medium">
                    <Activity className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{String(event ?? "")}</span>
                  </span>
                  <span className="ml-auto hidden max-w-[45%] truncate text-xs text-muted-foreground sm:block">
                    {summaryLine(rest)}
                  </span>
                </summary>
                <pre className="overflow-x-auto border-t border-border/40 bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
                  {JSON.stringify({ "@timestamp": ts, level: lv, event, ...rest }, null, 2)}
                </pre>
              </details>
            );
          })}
        </div>
      )}

      {data?.enabled && (
        <PaginationBar
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}