import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { getShowtimeById, createShowtime, updateShowtime, getHalls } from "@/api/showtimes.api";
import { getMovies } from "@/api/movies.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  movieId: z.string().min(1, "Select a movie"),
  hallId: z.string().min(1, "Select a hall"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:mm"),
  ticketPrice: z.number().positive("Price must be positive"),
});

type FormData = z.infer<typeof schema>;

export function ShowtimeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: halls = [] } = useQuery({
    queryKey: ["halls"],
    queryFn: getHalls,
  });

  const { data: moviesData } = useQuery({
    queryKey: ["admin", "movies"],
    queryFn: () => getMovies({ limit: 100 }),
  });

  const { data: existingShowtime } = useQuery({
    queryKey: ["showtime", id],
    queryFn: () => getShowtimeById(id!),
    enabled: isEdit,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      movieId: "",
      hallId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "18:00",
      endTime: "20:30",
      ticketPrice: 50,
    },
  });

  useEffect(() => {
    if (isEdit && existingShowtime) {
      form.reset({
        movieId: existingShowtime.movieId,
        hallId: existingShowtime.hallName,
        date: existingShowtime.date,
        startTime: existingShowtime.startTime,
        endTime: existingShowtime.endTime,
        ticketPrice: existingShowtime.ticketPrice,
      });
    }
  }, [isEdit, existingShowtime, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const selectedHall = halls.find((h) => h.name === data.hallId);
      const payload = {
        ...data,
        totalCapacity: selectedHall?.capacity ?? 80,
      };

      if (isEdit) {
        await updateShowtime(id!, payload);
        toast.success("Showtime updated");
      } else {
        await createShowtime(payload);
        toast.success("Showtime created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "showtimes"] });
      navigate("/admin/showtimes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save showtime");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/admin/showtimes">
          <Button variant="ghost" size="sm" className="mb-2 gap-1.5">
            <ArrowLeft className="size-4" />
            Back to Showtimes
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit Showtime" : "Add Showtime"}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="movieId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Movie</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select a movie" />
                  </SelectTrigger>
                  <SelectContent>
                    {(moviesData?.data ?? []).map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="hallId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Hall</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select a hall" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((h) => (
                      <SelectItem key={h.id} value={h.name}>{h.name} ({h.capacity} seats)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Date</FieldLabel>
                <Input {...field} type="date" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="startTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Start Time</FieldLabel>
                  <Input {...field} type="time" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="endTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>End Time</FieldLabel>
                  <Input {...field} type="time" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="ticketPrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Ticket Price</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
            {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update Showtime" : "Create Showtime"}
          </Button>
          <Link to="/admin/showtimes">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
