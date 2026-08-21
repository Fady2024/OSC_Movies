import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getMovies } from "@/api/movies.api";
import { MovieCard } from "@/components/shared/movie-card";
import { MovieGridSkeleton } from "@/components/shared/skeletons";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRE_LABELS } from "@/utils/format";
import { staggerContainer, scaleIn } from "@/components/shared/animations";
import { PaginationBar } from "@/components/shared/pagination-bar";
import type { MovieGenre, MovieStatus } from "@/types/movie.types";

const GENRES = Object.keys(GENRE_LABELS) as MovieGenre[];

export function MoviesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "");

  const status = (searchParams.get("status") as MovieStatus | null) ?? undefined;
  const genre = (searchParams.get("genre") as MovieGenre | null) ?? undefined;
  const sortBy = (searchParams.get("sortBy") as string | null) ?? "title";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      updateParam("search", searchInput.trim() || null);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["movies", { search: debouncedSearch, status, genre, sortBy, page }],
    queryFn: () =>
      getMovies({
        search: debouncedSearch || undefined,
        status,
        genre,
        sortBy: sortBy as "title" | "rating" | "releaseDate",
        sortOrder: "desc",
        page,
        limit: 20,
      }),
  });

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    updateParam("page", newPage === 1 ? null : String(newPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = useMemo(
    () => !!(debouncedSearch || status || genre),
    [debouncedSearch, status, genre]
  );

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("movies.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("movies.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("movies.searchPlaceholder")}
              className="pl-9"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={status ?? "all"}
              onValueChange={(v) => updateParam("status", v === "all" ? null : v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="now_showing">Now Showing</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => updateParam("sortBy", v)}>
              <SelectTrigger className="w-[130px]">
                <SlidersHorizontal className="size-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">{t("movies.sortTitle")}</SelectItem>
                <SelectItem value="rating">{t("movies.sortRating")}</SelectItem>
                <SelectItem value="releaseDate">{t("movies.sortRelease")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Genre Chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("genre", null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              !genre
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t("movies.allGenres")}
          </button>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => updateParam("genre", genre === g ? null : g)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                genre === g
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {GENRE_LABELS[g]}
            </button>
          ))}
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {debouncedSearch && (
              <Badge variant="secondary" className="gap-1">
                "{debouncedSearch}"
                <button onClick={() => { setSearchInput(""); setDebouncedSearch(""); updateParam("search", null); }}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {status && (
              <Badge variant="secondary" className="gap-1">
                {status === "now_showing" ? "Now Showing" : "Coming Soon"}
                <button onClick={() => updateParam("status", null)}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {genre && (
              <Badge variant="secondary" className="gap-1">
                {GENRE_LABELS[genre]}
                <button onClick={() => updateParam("genre", null)}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
              {t("movies.clearFilters")}
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <MovieGridSkeleton count={10} />
      ) : isError ? (
        <ErrorState title={t("movies.errorTitle")} onRetry={refetch} />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title={t("movies.noResults")}
          description={t("movies.noResultsDesc")}
          action={
            <Button onClick={clearFilters} variant="outline">
              {t("movies.clearFilters")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {t("movies.results", {
              count: data?.total ?? 0,
              items: t(data?.total === 1 ? "movies.resultSingular" : "movies.resultPlural"),
            })}
          </div>
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {data?.data.map((movie) => (
              <motion.div
                key={movie.id}
                variants={scaleIn}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>

          <PaginationBar
            page={page}
            totalPages={data?.totalPages ?? 1}
            total={data?.total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
