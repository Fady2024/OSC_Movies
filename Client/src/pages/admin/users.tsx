import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Search, BellRing, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { getAdminUsers, updateUserRole } from "@/api/admin.api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { formatDate, formatPrice } from "@/utils/format";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => {
      toast.success(t("admin.users.roleUpdated"));
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t("admin.users.roleUpdateError");
      toast.error(message);
    },
  });

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "users", { search: debouncedSearch, role: roleFilter, page }],
    queryFn: () =>
      getAdminUsers({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        page,
        limit: 15,
      }),
  });

  const roles = ["", "customer", "admin"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.users.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.users.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.users.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {r === "" ? t("admin.users.all") : r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data?.data ?? []).length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title={t("admin.users.empty")}
          description={t("admin.users.emptyDesc")}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("admin.users.user")}
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
                  {t("admin.users.role")}
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                  {t("admin.users.notifications")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("admin.users.bookings")}
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
                  {t("admin.users.spent")}
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                  {t("admin.users.joined")}
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Select
                      value={u.role}
                      onValueChange={(role) => {
                        if (u.id === currentUser?.id) {
                          toast.error(t("admin.users.ownRole"));
                  return;
                        }
                        if (role !== u.role) {
                          roleMutation.mutate({ id: u.id, role });
                        }
                      }}
                      disabled={roleMutation.isPending}
                    >
                      <SelectTrigger size="sm" className="min-w-[110px] gap-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">
                          <span className="flex items-center gap-1.5">customer</span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-1.5">
                            <Shield className="size-3" /> admin
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {u.notifyNewMovies ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <BellRing className="size-3.5" /> {t("admin.users.on")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("admin.users.off")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">{u.bookingCount}</td>
                  <td className="hidden px-4 py-3 text-right text-sm text-muted-foreground sm:table-cell">
                    {formatPrice(u.totalSpent)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-xs text-muted-foreground lg:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total}
        onPageChange={setPage}
      />
    </div>
  );
}