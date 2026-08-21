import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { resetPassword } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useTranslation } from "react-i18next";

const strongPasswordSchema = (t: (k: string) => string) =>
  z
    .string()
    .min(8, t("auth.register.passwordStrength"))
    .regex(/[A-Za-z]/, t("auth.register.passwordLetter"))
    .regex(/\d/, t("auth.register.passwordNumber"));

const schema = (t: (k: string) => string) =>
  z
    .object({
      password: strongPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("auth.register.passwordMatch"),
      path: ["confirmPassword"],
    });

type FormData = z.infer<ReturnType<typeof schema>>;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema(t)),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await resetPassword(token, data.password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
          <EmailIcon />
          <h1 className="mt-4 text-xl font-bold tracking-tight">{t("auth.reset.invalidLink")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.reset.invalidLinkDesc")}
          </p>
          <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            {t("auth.reset.requestNew")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/filmak-logo.png" alt="Filmak" className="size-10 rounded-lg object-cover" />
            <span className="text-2xl font-bold tracking-tight">Filmak</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">{t("auth.reset.doneTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("auth.reset.doneDesc")}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">{t("auth.reset.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("auth.reset.subtitle")}
                </p>
              </div>

              {serverError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {serverError}
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{t("auth.reset.newPassword")}</FieldLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{t("auth.reset.confirmPassword")}</FieldLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? t("auth.reset.resetting") : t("auth.reset.reset")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailIcon() {
  return (
    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
      <AlertCircle className="size-6 text-destructive" />
    </div>
  );
}