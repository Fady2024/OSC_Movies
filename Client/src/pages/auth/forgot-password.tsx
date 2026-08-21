import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { forgotPassword } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useTranslation } from "react-i18next";

const schema = (t: (k: string) => string) =>
  z.object({
    email: z.string().email(t("auth.login.invalidEmail")),
  });

type FormData = z.infer<ReturnType<typeof schema>>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema(t)),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

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
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">{t("auth.forgot.sent")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("auth.forgot.sentDesc")}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                {t("auth.forgot.backToSignIn")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">{t("auth.forgot.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("auth.forgot.subtitle")}
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
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{t("auth.forgot.email")}</FieldLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          placeholder={t("auth.forgot.emailPlaceholder")}
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
                  {form.formState.isSubmitting ? t("auth.forgot.sending") : t("auth.forgot.send")}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("auth.forgot.remembered")}{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  {t("auth.forgot.signIn")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}