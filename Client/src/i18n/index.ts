import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { ar } from "./locales/ar";

const STORAGE_KEY = "cinema_lang";

function getInitialLanguage(): string {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ar" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export const language = getInitialLanguage();

function applyDocumentLanguage(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

applyDocumentLanguage(language);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: language,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function setLanguage(lang: "en" | "ar") {
  localStorage.setItem(STORAGE_KEY, lang);
  applyDocumentLanguage(lang);
  void i18n.changeLanguage(lang);
}

export default i18n;