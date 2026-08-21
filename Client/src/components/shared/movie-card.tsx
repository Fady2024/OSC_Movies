import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Movie } from "@/types/movie.types";
import { Badge } from "@/components/ui/badge";
import { GENRE_LABELS, STATUS_LABELS, formatDuration } from "@/utils/format";
import { cn } from "@/lib/utils";
import { LazyImage } from "./lazy-image";
import { FavoriteButton } from "./favorite-button";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/movies/${movie.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="size-full"
        >
          <LazyImage
            src={movie.posterUrl}
            alt={movie.title}
            className="size-full"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60 z-0" />

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-20">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge
              variant={movie.status === "now_showing" ? "default" : "secondary"}
              className={cn(
                "backdrop-blur-md",
                movie.status === "now_showing" && "bg-cinema-gold text-cinema-gold-foreground"
              )}
            >
              {STATUS_LABELS[movie.status]}
            </Badge>
          </motion.div>
        </div>

        {/* Rating and Favorite Button */}
        <motion.div
          className="absolute top-3 right-3 z-30 flex items-center gap-2 rounded-md bg-background/90 px-2 py-1 backdrop-blur-md"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <FavoriteButton movieId={movie.id} className="relative" />
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-cinema-gold text-cinema-gold" />
            <span className="text-xs font-semibold">{movie.rating.toFixed(1)}</span>
          </div>
        </motion.div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            {t("shared.viewDetails")}
          </motion.span>
        </motion.div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-tight tracking-tight line-clamp-1 transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {movie.genre.slice(0, 2).map((g) => GENRE_LABELS[g]).join(" · ")}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatDuration(movie.duration)}
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">
            {movie.ageRating}
          </span>
        </div>

        {movie.status === "now_showing" && (
          <motion.div
            className="mt-4"
            whileHover={{ scale: 1.02 }}
          >
            <span className="inline-flex w-full items-center justify-center rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              {t("shared.bookTickets")}
            </span>
          </motion.div>
        )}
      </div>
    </Link>
  );
}
