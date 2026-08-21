import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md"
      >
        <motion.div
          className="mb-6 text-9xl font-bold text-primary"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          404
        </motion.div>

        <h1 className="mb-3 text-2xl font-bold">{t("notFound.title")}</h1>
        <p className="mb-8 text-muted-foreground">
          {t("notFound.desc")}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/" className="gap-2">
              <Home className="size-4" />
              {t("notFound.goHome")}
            </Link>
          </Button>
          <Button asChild onClick={() => window.history.back()}>
            <button className="gap-2">
              <ArrowLeft className="size-4" />
              {t("notFound.goBack")}
            </button>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
