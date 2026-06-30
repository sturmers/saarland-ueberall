"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { countryFlag, countryContinent, countryOf, cityOf } from "@/lib/geo";
import { useLang } from "@/lib/i18n";

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
  stops: number;
  countries: number;
  continents: number;
  distanceKm: number;
  fromCity: string;
  fromFlag: string;
  toCity: string;
  toFlag: string;
  active: boolean;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function formatKm(km: number, locale: string): string {
  if (km <= 0) return "—";
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString(locale)} km`;
}

type SortKey = "stops" | "countries" | "distance" | "continents";

export default function LeaderboardPage() {
  const { t, locale } = useLang();
  const [stats, setStats] = useState<CardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("stops");

  const SORTS: { key: SortKey; label: string }[] = [
    { key: "stops", label: t.lb_sort_stops },
    { key: "countries", label: t.lb_sort_countries },
    { key: "distance", label: t.lb_sort_distance },
    { key: "continents", label: t.lb_sort_continents },
  ];

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(({ cards, entries }: { cards: CardRow[]; entries: EntryRow[] }) => {
        const byCard: Record<string, EntryRow[]> = {};
        for (const e of entries) {
          if (!byCard[e.card_id]) byCard[e.card_id] = [];
          byCard[e.card_id].push(e);
        }

        const now = Date.now();
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

          const countryNames = cardEntries.map(e => countryOf(e.location_name)).filter(Boolean);
          const countries = new Set(countryNames).size;
          const continents = new Set(
            countryNames.map(countryContinent).filter(Boolean)
          ).size;

          const first = cardEntries[0];
          const last = cardEntries[cardEntries.length - 1];
          const lastTime = last ? new Date(last.created_at).getTime() : 0;
          const active = last ? (now - lastTime) < 1000 * 60 * 60 * 24 * 90 : false;

          return {
            id: card.id,
            card_name: card.card_name || `Card #${card.id}`,
            stops: cardEntries.length,
            countries,
            continents,
            distanceKm,
            fromCity: first ? cityOf(first.location_name) : "—",
            fromFlag: first ? countryFlag(countryOf(first.location_name)) : "",
            toCity: last ? cityOf(last.location_name) : "—",
            toFlag: last ? countryFlag(countryOf(last.location_name)) : "",
            active,
          };
        });

        setStats(result);
        setLoading(false);
      });
  }, []);

  const sorted = [...stats].sort((a, b) => {
    if (sort === "distance") return b.distanceKm - a.distanceKm;
    if (sort === "countries") return b.countries - a.countries;
    if (sort === "continents") return b.continents - a.continents;
    return b.stops - a.stops;
  });

  const metricMax = Math.max(
    1,
    ...sorted.map(c =>
      sort === "distance" ? c.distanceKm : sort === "countries" ? c.countries : sort === "continents" ? c.continents : c.stops
    )
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "var(--cream)" }}>
      <Nav />

      {/* Header + toggle */}
      <section className="max-w-6xl mx-auto w-full px-4 md:px-12 pt-16 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
              {t.lb_label}
            </p>
            <h1 className="font-serif-display text-4xl md:text-5xl leading-none" style={{ color: "var(--text)" }}>
              {t.lb_title}
            </h1>
          </div>

          <div className="flex gap-1 p-1 rounded-full max-w-full overflow-x-auto" style={{ background: "var(--cream-dark)" }}>
            {SORTS.map(({ key, label }) => (
              <button key={key} onClick={() => setSort(key)}
                className="px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: sort === key ? "var(--dark)" : "transparent",
                  color: sort === key ? "#fff" : "var(--text-muted)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-12 pb-16 flex-1">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>{t.loading}</p>
        ) : sorted.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>{t.no_cards}</p>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(46,38,32,0.1)" }}>
            {/* Header row */}
            <div className="hidden md:grid items-center gap-4 px-6 py-4 text-xs font-medium uppercase tracking-wider"
              style={{ gridTemplateColumns: "2.5rem 1fr 5rem 6rem 6rem 7rem 5rem", background: "rgba(232,220,200,0.5)", color: "var(--text-muted)" }}>
              <span></span>
              <span>{t.lb_col_card}</span>
              <span className="text-center">{t.lb_sort_stops}</span>
              <span className="text-center">{t.lb_sort_countries}</span>
              <span className="text-center">{t.lb_sort_continents}</span>
              <span className="text-right">{t.lb_sort_distance}</span>
              <span>{t.status_active === "Aktiv" ? "Status" : "Status"}</span>
            </div>

            {sorted.map((card, i) => {
              const metricValue = sort === "distance" ? card.distanceKm : sort === "countries" ? card.countries : sort === "continents" ? card.continents : card.stops;
              const mobileDisplay = sort === "distance" ? formatKm(card.distanceKm, locale) : `${metricValue}`;
              const activeLabel = sort === "distance" ? t.lb_sort_distance : sort === "countries" ? t.lb_sort_countries : sort === "continents" ? t.lb_sort_continents : t.lb_sort_stops;
              return (
              <Link key={card.id} href={`/karte/${card.id}`}
                className="flex md:grid items-center gap-4 px-4 md:px-6 py-5 transition-colors hover:bg-black/[0.02]"
                style={{
                  gridTemplateColumns: "2.5rem 1fr 5rem 6rem 6rem 7rem 5rem",
                  background: "var(--cream)",
                  borderTop: "1px solid rgba(46,38,32,0.08)",
                  textDecoration: "none", color: "inherit",
                }}>
                {/* Rank / medal */}
                <div className="text-center flex-shrink-0 w-7 md:w-auto">
                  {i < 3 ? (
                    <span className="text-xl">{medals[i]}</span>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                  )}
                </div>

                {/* Card info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif-display text-base truncate" style={{ color: "var(--text)" }}>{card.card_name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
                      style={{ background: "var(--cream-dark)", color: "var(--text-muted)" }}>
                      {card.id}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                    {t.lb_from} {card.fromCity} {card.fromFlag} → {card.toCity} {card.toFlag}
                  </p>
                  {/* progress bar */}
                  <div className="h-1 rounded-full max-w-[200px]" style={{ background: "rgba(46,38,32,0.08)" }}>
                    <div className="h-1 rounded-full" style={{
                      width: `${Math.round(((sort === "distance" ? card.distanceKm : sort === "countries" ? card.countries : sort === "continents" ? card.continents : card.stops) / metricMax) * 100)}%`,
                      background: i === 0 ? "var(--accent)" : "var(--green)",
                    }} />
                  </div>
                </div>

                {/* Mobile compact metric */}
                <div className="md:hidden text-right flex-shrink-0 pl-2">
                  <div className="font-serif-display text-lg leading-none" style={{ color: "var(--accent)" }}>{mobileDisplay}</div>
                  <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{activeLabel}</div>
                </div>

                {/* Stops */}
                <div className="hidden md:block text-center font-medium" style={{ color: "var(--accent)" }}>{card.stops}</div>
                {/* Countries */}
                <div className="hidden md:block text-center font-medium" style={{ color: "var(--text)" }}>{card.countries || "—"}</div>
                {/* Continents */}
                <div className="hidden md:block text-center font-medium" style={{ color: "var(--text)" }}>{card.continents || "—"}</div>
                {/* Distance */}
                <div className="hidden md:block text-right">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{formatKm(card.distanceKm, locale)}</span>
                </div>
                {/* Status */}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: card.active ? "var(--green)" : "rgba(46,38,32,0.25)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{card.active ? t.status_active : t.status_paused}</span>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid rgba(46,38,32,0.08)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-12 py-6 flex gap-8 text-xs" style={{ color: "var(--text-muted)" }}>
          <Link href="/#map" className="hover:opacity-60 transition-opacity">{t.nav_worldmap}</Link>
          <Link href="/impressum" className="hover:opacity-60 transition-opacity">{t.footer_imprint}</Link>
          <Link href="/datenschutz" className="hover:opacity-60 transition-opacity">{t.footer_privacy}</Link>
        </div>
      </footer>
    </div>
  );
}
