import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { getDeletedMovies, restoreMovie } from "@/api/movies.api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { GENRE_LABELS, STATUS_LABELS, formatDuration } from "@/utils/format";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AdminDeletedMoviesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "deleted-movies", { search: debouncedSearch, page }],
    queryFn: () =>
      getDeletedMovies({ search: debouncedSearch || undefined, page, limit: 10 }),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreMovie(id),
    onSuccess: () => {
      toast.success(t("admin.deletedMovies.restored"));
      queryClient.invalidateQueries({ queryKey: ["admin", "deleted-movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
    onError: () => {
      toast.error(t("admin.deletedMovies.restoreFailed"));
    },
  });

  const movies = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.deletedMovies.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.deletedMovies.subtitle")}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.deletedMovies.searchPlaceholder")}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : movies.length === 0 ? (
        <EmptyState
          icon={<ArchiveRestore className="size-6" />}
          title={t("admin.deletedMovies.empty")}
          description={t("admin.deletedMovies.emptyDesc")}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="hidden w-full md:table">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.title")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.genres")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.status")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.deletedMovies.deletedAt")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={movie.posterUrl} alt={movie.title} className="size-10 rounded object-cover opacity-70 grayscale" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{movie.title}</p>
                        <p className="text-xs text-muted-foreground">{movie.director}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {movie.genre.slice(0, 2).map((g) => GENRE_LABELS[g]).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDuration(movie.duration)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{STATUS_LABELS[movie.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {movie.deletedAt ? formatDate(movie.deletedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-emerald-600 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400">
                            <ArchiveRestore className="size-4" />
                            {t("admin.deletedMovies.restore")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("admin.deletedMovies.restoreTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("admin.deletedMovies.restoreDesc")}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => restoreMutation.mutate(movie.id)}>
                              {t("admin.deletedMovies.restore")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y md:hidden">
            {movies.map((movie) => (
              <div key={movie.id} className="flex items-center gap-3 p-4">
                <img src={movie.posterUrl} alt={movie.title} className="size-12 rounded object-cover opacity-70 grayscale" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {movie.genre.slice(0, 2).map((g) => GENRE_LABELS[g]).join(", ")} · {formatDuration(movie.duration)}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {STATUS_LABELS[movie.status]}
                  </Badge>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-emerald-600 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400">
                      <ArchiveRestore className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("admin.deletedMovies.restoreTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("admin.deletedMovies.restoreDesc")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => restoreMutation.mutate(movie.id)}>
                        {t("admin.deletedMovies.restore")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}