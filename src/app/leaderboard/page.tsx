"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

type CardRow = {
  id: string;
  card_name: string;
  launch_message: string;
  created_at: string;
};

type EntryRow = {
  id: string;
  card_id: string;
  name: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

type CardStat = {
  id: string;
  card_name: string;
  launch_message: string;
  firstFinder: string;
  stops: number;
  distanceKm: number;
  countries: number;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function formatKm(km: number): string {
  if (km === 0) return "—";
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("de-DE")} km`;
}

type SortKey = "distance" | "stops" | "countries";

export default function LeaderboardPage() {
  const [stats, setStats] = useState<CardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("distance");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(({ cards, entries }: { cards: CardRow[]; entries: EntryRow[] }) => {
        const byCard: Record<string, EntryRow[]> = {};
        for (const e of entries) {
          if (!byCard[e.card_id]) byCard[e.card_id] = [];
          byCard[e.card_id].push(e);
        }

        const result: CardStat[] = cards.map(card => {
          const cardEntries = (byCard[card.id] ?? []).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          let distanceKm = 0;
          for (let i = 1; i < cardEntries.length; i++) {
            const prev = cardEntries[i - 1];
            const curr = cardEntries[i];
            if (prev.lat && prev.lng && curr.lat && curr.lng) {
              distanceKm += haversineKm(prev.lat, prev.lng, curr.lat, curr.lng);
            }
          }

          const countries = new Set(
            cardEntries.map(e => e.location_name?.split(",").pop()?.trim()).filter(Boolean)
          ).size;

          return {
            id: card.id,
            card_name: card.card_name || `Card #${card.id}`,
            launch_message: card.launch_message || "",
            firstFinder: cardEntries[0]?.name ?? "—",
            stops: cardEntries.length,
            distanceKm,
            countries,
          };
        });

        setStats(result);
        setLoading(false);
      });
  }, []);

  const sorted = [...stats].sort((a, b) => {
    if (sort === "distance") return b.distanceKm - a.distanceKm;
    if (sort === "stops") return b.stops - a.stops;
    return b.countries - a.countries;
  });

  const medalColors = ["#F59E0B", "#9CA3AF", "#CD7C5A"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff" }}>
      <Nav />

      {/* Header */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-10" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          Leaderboard
        </p>
        <h1 className="font-bold leading-none mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.04em" }}>
          Which card<br />traveled furthest?
        </h1>
        <p className="text-base" style={{ color: "var(--text-muted)", maxWidth: 480 }}>
          Every CarryOn card tells a different story. Here's how they stack up.
        </p>
      </section>

      {/* Sort tabs */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 pb-2 flex gap-2">
        {(["distance", "stops", "countries"] as SortKey[]).map(key => (
          <button key={key} onClick={() => setSort(key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: sort === key ? "var(--accent)" : "var(--cream-dark)",
              color: sort === key ? "#fff" : "var(--text-muted)",
            }}>
            {key === "distance" ? "Distance" : key === "stops" ? "Most Stops" : "Countries"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : sorted.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No cards yet.</p>
        ) : (
          <div className="space-y-px" style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {sorted.map((card, i) => (
              <Link key={card.id} href={`/karte/${card.id}`}
                className="flex items-center gap-6 px-6 py-5 transition-colors hover:bg-orange-50"
                style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", display: "flex", textDecoration: "none", color: "inherit" }}>

                {/* Rank */}
                <div className="w-8 flex-shrink-0 text-center">
                  {i < 3 ? (
                    <span className="text-xl" style={{ color: medalColors[i] }}>
                      {["🥇", "🥈", "🥉"][i]}
                    </span>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                  )}
                </div>

                {/* Card info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate" style={{ letterSpacing: "-0.01em" }}>
                    {card.card_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Sent by <strong style={{ color: "var(--text)", fontWeight: 600 }}>{card.firstFinder}</strong>
                    {card.launch_message && (
                      <span className="italic"> · „{card.launch_message.slice(0, 60)}{card.launch_message.length > 60 ? "…" : ""}"</span>
                    )}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>{formatKm(card.distanceKm)}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>distance</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-lg">{card.stops}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>stops</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-lg">{card.countries || "—"}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>countries</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex gap-8 text-xs" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-60 transition-opacity">World Map</Link>
          <Link href="/impressum" className="hover:opacity-60 transition-opacity">Impressum</Link>
        </div>
      </footer>
    </div>
  );
}
