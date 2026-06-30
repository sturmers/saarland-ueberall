"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import { useLang } from "@/lib/i18n";

export default function ShopPage() {
  const { t } = useLang();
  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ background: "var(--cream)" }}>
      <Nav />
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--accent)" }}>
          {t.shop_coming}
        </p>
        <h1 className="font-serif-display text-4xl md:text-5xl mb-6" style={{ color: "var(--text)" }}>
          {t.shop_title}
        </h1>
        <p className="text-base max-w-md mb-10" style={{ color: "var(--text-muted)" }}>
          {t.shop_desc}
        </p>
        <Link
          href="/"
          className="text-sm font-semibold px-6 py-3 rounded-full transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {t.shop_back}
        </Link>
      </section>
    </div>
  );
}
