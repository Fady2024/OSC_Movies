import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Film, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { getMovies, deleteMovie } from "@/api/movies.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { GENRE_LABELS, STATUS_LABELS, formatDuration } from "@/utils/format";
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

export function AdminMoviesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "movies", { search, page }],
    queryFn: () => getMovies({ search: search || undefined, page, limit: 10 }),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMovie(id);
      toast.success(t("admin.movies.deleted"));
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
    } catch {
      toast.error(t("admin.movies.deleteFailed"));
    }
  };

  const movies = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.movies.listTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.movies.subtitle")}</p>
        </div>
        <Link to="/admin/movies/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            {t("admin.movies.addMovie")}
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t("admin.movies.searchPlaceholder")}
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
          icon={<Film className="size-6" />}
          title="No movies found"
          description="Add your first movie to start building the catalog."
          action={
            <Link to="/admin/movies/new">
              <Button>{t("admin.movies.addMovie")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          {/* Desktop table */}
          <table className="hidden w-full md:table">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.title")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.genres")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.movies.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={movie.posterUrl} alt={movie.title} className="size-10 rounded object-cover" />
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
                    <Badge variant={movie.status === "now_showing" ? "default" : "secondary"}>
                      {STATUS_LABELS[movie.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/movies/${movie.id}/edit`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("admin.movies.deleteTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("admin.movies.deleteDesc")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(movie.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
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

          {/* Mobile cards */}
          <div className="divide-y md:hidden">
            {movies.map((movie) => (
              <div key={movie.id} className="flex items-center gap-3 p-4">
                <img src={movie.posterUrl} alt={movie.title} className="size-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {movie.genre.slice(0, 2).map((g) => GENRE_LABELS[g]).join(", ")} · {formatDuration(movie.duration)}
                  </p>
                  <Badge variant={movie.status === "now_showing" ? "default" : "secondary"} className="mt-1">
                    {STATUS_LABELS[movie.status]}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <Link to={`/admin/movies/${movie.id}/edit`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("admin.movies.deleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.movies.deleteDesc")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(movie.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
