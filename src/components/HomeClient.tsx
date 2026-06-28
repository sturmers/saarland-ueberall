"use client";

import dynamic from "next/dynamic";
import Nav from "./Nav";
import type { Entry } from "@/lib/supabase";
import Link from "next/link";

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });

type Props = {
  entries: Entry[];
  instagramUrl: string;
};

export default function HomeClient({ entries, instagramUrl }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav instagramUrl={instagramUrl} />

      {/* Hero */}
      <section className="px-4 py-12 text-center max-w-2xl mx-auto">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "var(--accent)" }}
        >
          Einen Saarländer trifft man überall
        </p>
        <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text)" }}>
          Saarländer weltweit finden
        </h1>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Physische Karten reisen um die Welt. Jeder Finder trägt sich ein –
          und eine Kette aus Menschen verbindet sich.
          {entries.length > 0 && (
            <span className="font-medium" style={{ color: "var(--text)" }}>
              {" "}Bereits {entries.length} Fundorte eingetragen.
            </span>
          )}
        </p>
      </section>

      {/* Karte – immer sichtbar */}
      <section className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden border" style={{ minHeight: 480, borderColor: "var(--border)" }}>
        <WorldMap entries={entries} />
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <p>© {new Date().getFullYear()} Saarländer weltweit</p>
          <div className="flex gap-6">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
            )}
            <Link href="/impressum" className="hover:underline">Impressum</Link>
            <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
