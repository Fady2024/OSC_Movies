import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLanguage } from "@/i18n";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggle = () => {
    setLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle language"
      title={i18n.language === "ar" ? "English" : "العربية"}
    >
      <Languages className="size-4" />
      <span className="sr-only">
        {i18n.language === "ar" ? "English" : "العربية"}
      </span>
    </Button>
  );
}