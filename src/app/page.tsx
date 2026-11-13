"use client";

import Link from "next/link";
import { Checker } from "@/components/Checker";
import { LangToggle, useLang } from "@/components/LangContext";
import { T } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div className="page">
      <header className="top">
        <Link href="/" className="wordmark">
          Kerja<span>Check</span>
        </Link>
        <LangToggle />
      </header>
      <main>
        <p className="tagline">{t.tagline}</p>
        <h1>{t.h1}</h1>
        <p className="lede">{t.lede}</p>
        <Checker />
      </main>
      <footer className="foot">
        <p>{t.privacy}</p>
        <p>
          <Link href="/how-it-works">{t.how}</Link>
        </p>
      </footer>
    </div>
  );
}
