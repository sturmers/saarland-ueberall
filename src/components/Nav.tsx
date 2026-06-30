"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Props = {
  instagramUrl?: string;
};

export default function Nav({ instagramUrl }: Props) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <Link href="/#map" onClick={() => setOpen(false)} className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--text-muted)" }}>
        {t.nav_worldmap}
      </Link>
      <Link href="/#how" onClick={() => setOpen(false)} className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--text-muted)" }}>
        {t.nav_how}
      </Link>
      <Link href="/leaderboard" onClick={() => setOpen(false)} className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--text-muted)" }}>
        {t.nav_stories}
      </Link>
      {instagramUrl && (
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
          className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--text-muted)" }}>
          Instagram
        </a>
      )}
    </>
  );

  return (
    <header style={{
      background: "rgba(250,246,240,0.92)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(46,38,32,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 1100,
    }}>
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif-display text-xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          CarryOn
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language switch */}
          <div className="flex items-center text-xs font-semibold rounded-full overflow-hidden" style={{ border: "1px solid rgba(46,38,32,0.15)" }}>
            {(["de", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className="px-3 py-2 transition-colors uppercase"
                style={{
                  background: lang === l ? "var(--dark)" : "transparent",
                  color: lang === l ? "#fff" : "var(--text-muted)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            {t.nav_getcard}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full"
            style={{ color: "var(--text)" }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-4 pb-4 pt-1 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(46,38,32,0.06)" }}>
          {links}
          <Link href="/shop" onClick={() => setOpen(false)} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            {t.nav_getcard}
          </Link>
        </div>
      )}
    </header>
  );
}
