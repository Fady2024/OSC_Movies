import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getFavorites } from "@/api/favorites.api";
import { MovieCard } from "@/components/shared/movie-card";
import { MovieGridSkeleton } from "@/components/shared/skeletons";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { staggerContainer, scaleIn } from "@/components/shared/animations";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { useState } from "react";

export function FavoritesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["favorites", page],
    queryFn: () => getFavorites(page, 10),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Heart className="fill-red-500 text-red-500 size-8" />
          {t("favorites.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("favorites.subtitle")}
        </p>
      </div>

      {/* Results */}
      {isLoading ? (
        <MovieGridSkeleton count={10} />
      ) : isError ? (
        <ErrorState title={t("favorites.errorTitle")} onRetry={refetch} />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title={t("favorites.noFavorites")}
          description={t("favorites.noFavoritesDesc")}
        />
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {t("favorites.count", {
              count: data?.total ?? 0,
              items: t(data?.total === 1 ? "favorites.resultSingular" : "favorites.resultPlural"),
            })}
          </div>
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {data?.data.map((favorite) => (
              <motion.div
                key={favorite.id}
                variants={scaleIn}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MovieCard movie={favorite.movie} />
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
