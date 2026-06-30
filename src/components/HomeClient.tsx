"use client";

import dynamic from "next/dynamic";
import Nav from "./Nav";
import type { Entry } from "@/lib/supabase";
import Link from "next/link";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function totalDistanceKm(entries: Entry[]): number {
  const byCard: Record<string, Entry[]> = {};
  for (const e of entries) {
    if (!byCard[e.card_id]) byCard[e.card_id] = [];
    byCard[e.card_id].push(e);
  }
  let total = 0;
  for (const cardEntries of Object.values(byCard)) {
    const sorted = [...cardEntries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const p = sorted[i - 1], c = sorted[i];
      if (p.lat && p.lng && c.lat && c.lng) total += haversineKm(p.lat, p.lng, c.lat, c.lng);
    }
  }
  return total;
}

function formatKm(km: number): string {
  if (km < 1000) return `${Math.round(km)} km`;
  return `${(km / 1000).toFixed(1).replace(".", ",")} Tsd. km`;
}

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });

type Props = {
  entries: Entry[];
  instagramUrl: string;
};

function stat(value: number | string, label: string) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)", letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export default function HomeClient({ entries, instagramUrl }: Props) {
  const uniqueCards = new Set(entries.map(e => e.card_id)).size;
  const uniqueCountries = new Set(
    entries.map(e => e.location_name?.split(",").pop()?.trim()).filter(Boolean)
  ).size;
  const kmTotal = totalDistanceKm(entries);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fff" }}>
      <Nav instagramUrl={instagramUrl} />

      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-12">
        <div className="max-w-3xl">
          <h1 className="font-bold leading-none mb-6" style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            letterSpacing: "-0.04em",
            color: "var(--text)",
          }}>
            Every Card<br />Has a Journey.
          </h1>
          <p className="text-lg leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
            CarryOn turns a simple card into a worldwide adventure.
            Scan the QR code, add your name and location, then pass it on.
            Watch the journey unfold on the live map below.
          </p>
          <Link href="/leaderboard"
            className="inline-flex items-center gap-2 mt-6 text-sm font-semibold"
            style={{ color: "var(--accent)" }}>
            View Leaderboard →
          </Link>
        </div>

        {/* Stats */}
        {entries.length > 0 && (
          <div className="flex flex-wrap items-center gap-10 mt-12 pt-12" style={{ borderTop: "1px solid var(--border)" }}>
            {stat(entries.length, "Total Finds")}
            <div style={{ width: 1, height: 40, background: "var(--border)" }} />
            {stat(uniqueCards, "Cards Traveling")}
            <div style={{ width: 1, height: 40, background: "var(--border)" }} />
            {stat(uniqueCountries > 0 ? `${uniqueCountries}+` : "—", "Countries")}
            <div style={{ width: 1, height: 40, background: "var(--border)" }} />
            {stat(kmTotal > 0 ? formatKm(kmTotal) : "—", "Total Distance")}
          </div>
        )}
      </section>

      {/* Map – full width, edge to edge */}
      <section style={{ flex: 1, minHeight: 520, position: "relative", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <WorldMap entries={entries} />
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16">
        <p className="text-xs font-semibold tracking-widest uppercase mb-10" style={{ color: "var(--accent)" }}>
          How It Works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
          {[
            { num: "01", title: "Find a Card", body: "Discover a CarryOn card in the wild — in a café, on a car, or passed to you by a stranger." },
            { num: "02", title: "Add Your Story", body: "Scan the QR code, enter your name and location, and leave a personal message for the next finder." },
            { num: "03", title: "Pass It On", body: "Leave the card somewhere new. Watch the journey continue on the live world map." },
          ].map(step => (
            <div key={step.num} className="p-8" style={{ background: "#fff" }}>
              <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "var(--accent)" }}>{step.num}</p>
              <h3 className="text-lg font-bold mb-3" style={{ letterSpacing: "-0.02em" }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Carry<span style={{ color: "var(--accent)" }}>On</span>
            </span>
            <span className="text-xs ml-3" style={{ color: "var(--text-muted)" }}>by AWAH Crafted for Life</span>
          </div>
          <div className="flex gap-8 text-xs" style={{ color: "var(--text-muted)" }}>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">Instagram</a>
            )}
            <Link href="/impressum" className="hover:opacity-60 transition-opacity">Impressum</Link>
            <Link href="/datenschutz" className="hover:opacity-60 transition-opacity">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
