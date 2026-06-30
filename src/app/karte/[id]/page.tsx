"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import type { Entry } from "@/lib/supabase";
import { countryFlag, countryContinent, countryOf, cityOf } from "@/lib/geo";
import { useLang, fill } from "@/lib/i18n";
import { Calendar, MapPin } from "lucide-react";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

type CardData = {
  card: { id: string; card_name: string; launch_message: string; created_at: string };
  entries: Entry[];
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
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString(locale)} km`;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

function formatDays(days: number, lang: "de" | "en"): string {
  if (lang === "de") {
    if (days === 0) return "selber Tag";
    if (days === 1) return "1 Tag";
    if (days < 30) return `${days} Tage`;
    const m = Math.floor(days / 30);
    return m === 1 ? "1 Monat" : `${m} Monate`;
  }
  if (days === 0) return "same day";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const m = Math.floor(days / 30);
  return m === 1 ? "1 month" : `${m} months`;
}

export default function KartePage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, locale } = useLang();
  const [data, setData] = useState<CardData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeStop, setActiveStop] = useState(0);

  useEffect(() => {
    fetch(`/api/card/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => {
        if (d) {
          setData(d);
          const n = (d.entries ?? []).length;
          if (n > 0) setActiveStop(n - 1);
        }
      });
  }, [id]);

  if (notFound) return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "var(--cream)" }}>
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif-display text-3xl mb-3" style={{ color: "var(--text)" }}>{t.notfound_title}</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>{fill(t.notfound_desc, { id })}</p>
        <Link href="/" className="text-sm font-medium" style={{ color: "var(--accent)" }}>{t.back_map}</Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "var(--cream)" }}>
      <Nav />
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>{t.loading}</p>
      </div>
    </div>
  );

  const sorted = [...data.entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const cardName = data.card.card_name || `Card #${data.card.id}`;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Stats
  let totalKm = 0;
  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i - 1], c = sorted[i];
    if (p.lat && p.lng && c.lat && c.lng) totalKm += haversineKm(p.lat, p.lng, c.lat, c.lng);
  }
  const cities = new Set(sorted.map(e => cityOf(e.location_name)).filter(Boolean)).size;
  const continents = new Set(
    sorted.map(e => countryContinent(countryOf(e.location_name))).filter(Boolean)
  ).size;

  const active = last ? (Date.now() - new Date(last.created_at).getTime()) < 1000 * 60 * 60 * 24 * 90 : false;
  const activeEntry = sorted[activeStop];

  const stats = [
    { label: t.stat_cities, value: `${cities}` },
    { label: t.stat_continents, value: `${continents || "—"}` },
    { label: t.stat_distance_short, value: formatKm(totalKm, locale) },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "var(--cream)" }}>
      <Nav />

      <div className="max-w-6xl mx-auto w-full px-4 md:px-12 py-8 md:py-12 flex-1">
        {/* Card header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: "var(--cream-dark)", color: "var(--text-muted)" }}>
                  {data.card.id}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ color: "var(--green)", background: "rgba(107,122,79,0.12)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "var(--green)" }} />
                  {active ? t.status_transit : t.status_resting}
                </span>
              </div>
              <h1 className="font-serif-display text-3xl md:text-[2.6rem] leading-tight" style={{ color: "var(--text)" }}>
                {cardName}
              </h1>
              {first && (
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {fill(t.started_in, { city: cityOf(first.location_name), date: formatDate(first.created_at, locale) })}
                </p>
              )}
              {data.card.launch_message && (
                <p className="text-base italic mt-3 max-w-xl" style={{ color: "var(--text-muted)" }}>
                  „{data.card.launch_message}"
                </p>
              )}
            </div>
            {sorted.length > 0 && (
              <div className="flex gap-8 shrink-0">
                {stats.map((s) => (
                  <div key={s.label} className="text-right">
                    <div className="font-serif-display text-2xl" style={{ color: "var(--text)" }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {sorted.filter(e => e.lat).length > 0 && (
          <div className="mb-10" style={{ height: 360, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(46,38,32,0.1)", position: "relative", zIndex: 0, isolation: "isolate" }}>
            <WorldMap entries={data.entries} />
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="py-16 text-center rounded-2xl" style={{ border: "1px solid rgba(46,38,32,0.1)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t.no_stops}</p>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Timeline */}
            <div>
              <h2 className="font-serif-display text-xl mb-5" style={{ color: "var(--text)" }}>{t.timeline_title}</h2>
              <div>
                {sorted.map((entry, i) => {
                  const isActive = activeStop === i;
                  const isLast = i === sorted.length - 1;
                  const city = cityOf(entry.location_name);
                  const country = countryOf(entry.location_name);
                  const flag = countryFlag(country);
                  const prev = sorted[i - 1];
                  const legKm = prev?.lat && prev?.lng && entry.lat && entry.lng
                    ? haversineKm(prev.lat, prev.lng, entry.lat, entry.lng) : null;
                  const legDays = prev ? daysBetween(prev.created_at, entry.created_at) : null;

                  return (
                    <div key={entry.id} className="flex gap-3">
                      {/* Spine */}
                      <div className="flex flex-col items-center flex-none w-7">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border shrink-0 transition-all"
                          style={isActive
                            ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }
                            : { background: "#fff", borderColor: "rgba(46,38,32,0.2)", color: "var(--text-muted)" }}>
                          {i + 1}
                        </div>
                        {!isLast && <div className="w-px flex-1 mt-1.5 min-h-[24px]" style={{ background: "rgba(46,38,32,0.12)" }} />}
                      </div>

                      {/* Card */}
                      <button
                        onClick={() => setActiveStop(i)}
                        className="mb-2 flex-1 text-left p-4 rounded-xl border transition-all"
                        style={isActive
                          ? { borderColor: "rgba(198,107,69,0.5)", background: "rgba(198,107,69,0.06)" }
                          : { borderColor: "rgba(46,38,32,0.1)", background: "rgba(255,255,255,0.6)" }}>
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{city}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{flag} {country}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Calendar size={11} style={{ color: "var(--text-muted)" }} />
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(entry.created_at, locale)}</span>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {t.found_by} <span className="font-medium" style={{ color: "var(--text)" }}>{entry.name}</span>
                          {entry.home_location && <> · {t.from_word} {entry.home_location}</>}
                        </p>
                        {legKm !== null && (
                          <p className="text-[11px] mt-1" style={{ color: "rgba(46,38,32,0.4)" }}>
                            {formatKm(legKm, locale)}{legDays !== null ? ` · ${formatDays(legDays, lang)} ${t.later_word}` : ""}
                          </p>
                        )}
                        {isActive && entry.comment && (
                          <p className="text-sm leading-relaxed mt-2 pt-2" style={{ color: "rgba(46,38,32,0.8)", borderTop: "1px solid rgba(46,38,32,0.08)" }}>
                            „{entry.comment}"
                          </p>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar: current stop */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <h2 className="font-serif-display text-xl mb-5" style={{ color: "var(--text)" }}>{t.current_stop}</h2>
                {activeEntry && (
                  <div className="rounded-2xl border p-6" style={{ borderColor: "rgba(46,38,32,0.1)", background: "#fff" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-3xl">{countryFlag(countryOf(activeEntry.location_name)) || "🌍"}</span>
                        <h3 className="font-serif-display text-2xl mt-2" style={{ color: "var(--text)" }}>
                          {cityOf(activeEntry.location_name)}
                        </h3>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{countryOf(activeEntry.location_name)}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ color: "var(--text-muted)", background: "var(--cream-dark)" }}>
                        {fill(t.stop_x_of_y, { x: activeStop + 1, y: sorted.length })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      <Calendar size={12} />
                      {formatDate(activeEntry.created_at, locale)}
                    </div>
                    <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      {t.found_by} <span className="font-medium" style={{ color: "var(--text)" }}>{activeEntry.name}</span>
                    </div>
                    {activeEntry.comment && (
                      <p className="text-sm leading-relaxed pt-4" style={{ color: "rgba(46,38,32,0.8)", borderTop: "1px solid rgba(46,38,32,0.08)" }}>
                        „{activeEntry.comment}"
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-center"
                  style={{ border: "2px dashed rgba(198,107,69,0.4)", color: "var(--accent)" }}>
                  <MapPin size={16} />
                  {t.scan_hint}
                </div>
              </div>
            </div>
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
