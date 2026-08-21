import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { getMovieById, createMovie, updateMovie } from "@/api/movies.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRE_LABELS } from "@/utils/format";
import type { MovieGenre } from "@/types/movie.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const GENRES = Object.keys(GENRE_LABELS) as MovieGenre[];

const schema = (t: (k: string) => string) =>
  z.object({
    title: z.string().min(1, t("admin.movieForm.title")),
    description: z.string().min(10, t("admin.movieForm.synopsis")),
    genre: z.array(z.string()).min(1, t("admin.movieForm.genres")),
    duration: z.number().min(1, t("admin.movieForm.duration")),
    rating: z.number().min(0).max(10),
    ageRating: z.string().min(1, t("admin.movieForm.ageRating")),
    status: z.enum(["now_showing", "coming_soon"]),
    posterUrl: z.string().url(t("admin.movieForm.posterUrl")),
    trailerUrl: z.string().url(t("admin.movieForm.posterUrl")).optional().or(z.literal("")),
    director: z.string().min(1, t("admin.movieForm.director")),
    cast: z.string(),
    releaseDate: z.string().min(1, t("admin.movieForm.year")),
    language: z.string().min(1, t("admin.movieForm.language")),
  });

type FormData = z.infer<ReturnType<typeof schema>>;

export function MovieFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingMovie } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id!),
    enabled: isEdit,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema(t)),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      genre: [],
      duration: 120,
      rating: 7.5,
      ageRating: "PG-13",
      status: "now_showing",
      posterUrl: "",
      trailerUrl: "",
      director: "",
      cast: "",
      releaseDate: new Date().toISOString().split("T")[0],
      language: "English",
    },
  });

  useEffect(() => {
    if (isEdit && existingMovie) {
      form.reset({
        title: existingMovie.title,
        description: existingMovie.description,
        genre: existingMovie.genre,
        duration: existingMovie.duration,
        rating: existingMovie.rating,
        ageRating: existingMovie.ageRating,
        status: existingMovie.status,
        posterUrl: existingMovie.posterUrl,
        trailerUrl: existingMovie.trailerUrl ?? "",
        director: existingMovie.director,
        cast: existingMovie.cast.join(", "),
        releaseDate: existingMovie.releaseDate,
        language: existingMovie.language,
      });
    }
  }, [isEdit, existingMovie, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        cast: data.cast.split(",").map((c) => c.trim()).filter(Boolean),
        genre: data.genre as MovieGenre[],
      };
      if (isEdit) {
        await updateMovie(id!, payload);
        toast.success("Movie updated");
      } else {
        await createMovie(payload);
        toast.success("Movie created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
      navigate("/admin/movies");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save movie");
    }
  };

  const selectedGenres = form.watch("genre") as MovieGenre[];

  const toggleGenre = (genre: MovieGenre) => {
    const current = form.getValues("genre") as MovieGenre[];
    const updated = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    form.setValue("genre", updated, { shouldValidate: true });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/admin/movies">
          <Button variant="ghost" size="sm" className="mb-2 gap-1.5">
            <ArrowLeft className="size-4" />
            Back to Movies
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit Movie" : "Create Movie"}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea {...field} id={field.name} rows={4} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Genres</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selectedGenres.includes(g)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {GENRE_LABELS[g]}
                </button>
              ))}
            </div>
            {form.formState.errors.genre && (
              <p className="text-sm text-destructive">{form.formState.errors.genre.message as string}</p>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Duration (minutes)</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Rating (0-10)</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.1"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="ageRating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Age Rating</FieldLabel>
                  <Input {...field} id={field.name} placeholder="PG-13" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now_showing">Now Showing</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="releaseDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Release Date</FieldLabel>
                  <Input {...field} id={field.name} type="date" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Language</FieldLabel>
                  <Input {...field} id={field.name} placeholder="English" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="director"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Director</FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="cast"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Cast (comma-separated)</FieldLabel>
                <Input {...field} id={field.name} placeholder="Actor 1, Actor 2" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="posterUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Poster URL</FieldLabel>
                <Input {...field} id={field.name} type="url" placeholder="https://..." aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="trailerUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Trailer URL (optional)</FieldLabel>
                <Input {...field} id={field.name} type="url" placeholder="https://..." aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
            {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update Movie" : "Create Movie"}
          </Button>
          <Link to="/admin/movies">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
