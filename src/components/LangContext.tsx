"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kc-lang");
      if (saved === "en" || saved === "ms") setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("kc-lang", l);
    } catch {}
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang" role="group" aria-label="Language / Bahasa">
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        English
      </button>
      <button type="button" aria-pressed={lang === "ms"} onClick={() => setLang("ms")}>
        Bahasa Melayu
      </button>
    </div>
  );
}
