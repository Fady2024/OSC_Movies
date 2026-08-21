import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PublicHeader } from "./public-header";

export function PublicLayout() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <motion.footer
        className="border-t border-border/60 bg-muted/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">Filmak</span>
              <span className="text-xs text-muted-foreground">{t("footer.tagline")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Meridian Cinema. {t("footer.rights")}
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
