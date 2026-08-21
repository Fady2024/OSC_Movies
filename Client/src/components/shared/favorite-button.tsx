import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, isFavorite } from "@/api/favorites.api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  movieId: string;
  className?: string;
  variant?: "icon" | "button";
}

export function FavoriteButton({ movieId, className, variant = "icon" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(false);

  const { data: isFavData } = useQuery({
    queryKey: ["isFavorite", movieId],
    queryFn: () => isFavorite(movieId),
    enabled: !!user,
  });

  useEffect(() => {
    if (isFavData !== undefined) {
      setIsFav(isFavData);
    }
  }, [isFavData]);

  const addMutation = useMutation({
    mutationFn: () => addFavorite(movieId),
    onSuccess: () => {
      setIsFav(true);
      queryClient.invalidateQueries({ queryKey: ["isFavorite", movieId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (favoriteId: string) => removeFavorite(favoriteId),
    onSuccess: () => {
      setIsFav(false);
      queryClient.invalidateQueries({ queryKey: ["isFavorite", movieId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      return;
    }

    if (isFav) {
      // Find the favorite ID and remove it
      queryClient.invalidateQueries({ queryKey: ["favorites"] }).then(() => {
        const favorites = queryClient.getQueryData(["favorites"]) as any;
        const favorite = favorites?.data?.find((f: any) => f.movie?.id === movieId);
        if (favorite) {
          removeMutation.mutate(favorite.id);
        }
      });
    } else {
      addMutation.mutate();
    }
  };

  if (!user) {
    return null;
  }

  if (variant === "button") {
    return (
      <Button
        onClick={handleToggle}
        variant={isFav ? "default" : "outline"}
        size="sm"
        className={cn("gap-2", className)}
        disabled={addMutation.isPending || removeMutation.isPending}
      >
        <Heart
          className={cn(
            "size-4",
            isFav && "fill-current"
          )}
        />
        {isFav ? "Favorited" : "Add to Favorites"}
      </Button>
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      className={cn(
        "rounded-full p-1 transition-colors hover:bg-background/50",
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <Heart
        className={cn(
          "size-3.5 transition-colors",
          isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
    </motion.button>
  );
}
