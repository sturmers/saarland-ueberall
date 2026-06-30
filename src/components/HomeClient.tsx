"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Nav from "./Nav";
import type { Card, Entry } from "@/lib/supabase";
import { countryFlag, countryOf, cityOf } from "@/lib/geo";
import { useLang, fill } from "@/lib/i18n";
import Link from "next/link";
import { Globe, MapPin, ArrowRight, Package, Share2, ChevronRight } from "lucide-react";

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

function formatKmShort(km: number, locale: string): string {
  if (km <= 0) return "—";
  if (km >= 1_000_000) return `${(km / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M km`;
  if (km >= 1000) return `${Math.round(km).toLocaleString(locale)} km`;
  return `${Math.round(km)} km`;
}

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });

type Props = {
  entries: Entry[];
  cards: Card[];
  instagramUrl: string;
};

type CardSummary = {
  card: Card;
  stops: number;
  countries: number;
  lastCity: string;
  lastCountry: string;
  flags: string[];
};

function summarize(card: Card, entries: Entry[]): CardSummary {
  const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const countryNames = sorted.map(e => countryOf(e.location_name)).filter(Boolean);
  const last = sorted[sorted.length - 1];
  const flags = Array.from(new Set(countryNames.map(countryFlag).filter(Boolean))).slice(-5);
  return {
    card,
    stops: sorted.length,
    countries: new Set(countryNames).size,
    lastCity: last ? cityOf(last.location_name) : "",
    lastCountry: last ? countryOf(last.location_name) : "",
    flags,
  };
}

// ─── Hero card mockup ───────────────────────────────────────────────────────
function CardMockup({ hero, fallbackName }: { hero: CardSummary | null; fallbackName: string }) {
  const title = hero?.card.card_name || fallbackName;
  const flags = hero && hero.flags.length ? hero.flags : ["🇦🇹", "🇫🇷", "🇺🇸", "🇯🇵", "🇦🇺"];
  const stops = hero ? hero.stops : 9;

  return (
    <div
      className="relative w-[280px] sm:w-80 h-52 rounded-2xl p-5 flex flex-col justify-between rotate-3 hover:rotate-1 transition-transform duration-500 select-none"
      style={{
        background: "linear-gradient(135deg, #E8DCC8 0%, #D4C4A8 100%)",
        boxShadow: "0 24px 60px rgba(46,38,32,0.22), 0 8px 20px rgba(46,38,32,0.12)",
      }}
    >
      <div className="flex justify-between items-start">
        <div className="pr-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>CarryOn</div>
          <div className="font-serif-display text-xl font-semibold mt-0.5 leading-tight" style={{ color: "var(--text)" }}>{title}</div>
        </div>
        <div className="w-14 h-14 rounded-md p-1.5 flex items-center justify-center shrink-0" style={{ background: "var(--dark)" }}>
          <svg viewBox="0 0 21 21" className="w-full" fill="#FAF6F0">
            <rect x="1" y="1" width="7" height="7" rx="0.5" />
            <rect x="2" y="2" width="5" height="5" fill="#2E2620" />
            <rect x="3" y="3" width="3" height="3" fill="#FAF6F0" />
            <rect x="13" y="1" width="7" height="7" rx="0.5" />
            <rect x="14" y="2" width="5" height="5" fill="#2E2620" />
            <rect x="15" y="3" width="3" height="3" fill="#FAF6F0" />
            <rect x="1" y="13" width="7" height="7" rx="0.5" />
            <rect x="2" y="14" width="5" height="5" fill="#2E2620" />
            <rect x="3" y="15" width="3" height="3" fill="#FAF6F0" />
            <rect x="9" y="1" width="2" height="2" />
            <rect x="11" y="1" width="2" height="2" />
            <rect x="9" y="4" width="3" height="2" />
            <rect x="9" y="9" width="3" height="3" />
            <rect x="12" y="9" width="2" height="5" />
            <rect x="9" y="13" width="5" height="2" />
            <rect x="13" y="9" width="2" height="2" />
            <rect x="16" y="10" width="2" height="4" />
            <rect x="14" y="14" width="2" height="2" />
          </svg>
        </div>
      </div>

      <div>
        <div className="h-px w-full mb-3" style={{ background: "rgba(46,38,32,0.15)" }} />
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {flags.map((f, j) => <span key={j} className="text-base">{f}</span>)}
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{stops}</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient({ entries, cards, instagramUrl }: Props) {
  const { t, locale } = useLang();

  const uniqueCards = new Set(entries.map(e => e.card_id)).size;
  const uniqueCountries = new Set(entries.map(e => countryOf(e.location_name)).filter(Boolean)).size;
  const kmTotal = totalDistanceKm(entries);

  const entriesByCard: Record<string, Entry[]> = {};
  for (const e of entries) {
    if (!entriesByCard[e.card_id]) entriesByCard[e.card_id] = [];
    entriesByCard[e.card_id].push(e);
  }

  const summaries = cards
    .map(c => summarize(c, entriesByCard[c.id] ?? []))
    .filter(s => s.stops > 0)
    .sort((a, b) => b.stops - a.stops);

  // Hero: random card among the top 20 in circulation (picked client-side after mount)
  const top20 = summaries.slice(0, 20);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (top20.length > 1) setHeroIndex(Math.floor(Math.random() * top20.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top20.length]);

  const hero = top20[heroIndex] ?? top20[0] ?? null;
  const featured = summaries.slice(0, 3);

  const heroStops = hero ? hero.stops : 9;
  const heroCountries = hero ? hero.countries : 6;
  const heroLastCity = hero && hero.lastCity ? hero.lastCity : "Sydney";
  const heroLastFlag = hero && hero.lastCountry ? (countryFlag(hero.lastCountry) || "🌍") : "🇦🇺";
  const heroHref = hero ? `/karte/${hero.card.id}` : "/leaderboard";

  const stats = [
    { value: uniqueCards > 0 ? `${uniqueCards}` : "—", label: t.stat_cards },
    { value: uniqueCountries > 0 ? `${uniqueCountries}` : "—", label: t.stat_countries },
    { value: formatKmShort(kmTotal, locale), label: t.stat_distance },
    { value: `${entries.length}`, label: t.stat_stops },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ background: "var(--cream)" }}>
      <Nav instagramUrl={instagramUrl} />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 md:px-12 pt-12 md:pt-20 pb-16 w-full">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{ background: "var(--cream-dark)", color: "var(--text-muted)" }}>
                <Globe size={12} style={{ color: "var(--accent)" }} />
                {uniqueCards > 0 ? fill(t.hero_badge, { n: uniqueCards }) : t.hero_badge_empty}
              </div>
              <h1 className="font-serif-display text-[2.7rem] sm:text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.05] mb-6" style={{ color: "var(--text)" }}>
                {t.hero_title_1}<br />
                <span className="italic font-light">{t.hero_title_2}</span>
              </h1>
              <p className="text-base leading-relaxed mb-10 max-w-sm" style={{ color: "var(--text-muted)" }}>
                {t.hero_desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#map"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "var(--accent)", color: "#fff" }}>
                  {t.hero_track}
                  <ArrowRight size={16} />
                </a>
                <Link href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium transition-colors"
                  style={{ border: "1px solid rgba(46,38,32,0.2)", color: "var(--text)" }}>
                  {t.hero_getown}
                </Link>
              </div>
            </div>

            {/* Right – card visual (clickable → that card's journey) */}
            <div className="relative flex items-center justify-center min-h-72">
              <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl" style={{ background: "rgba(198,107,69,0.08)" }} />
              <div className="absolute w-44 sm:w-52 h-44 sm:h-52 rounded-full blur-2xl translate-x-12 sm:translate-x-16 translate-y-10" style={{ background: "rgba(107,122,79,0.08)" }} />
              <div className="relative">
                <Link href={heroHref} aria-label={hero?.card.card_name || "card"} className="block cursor-pointer">
                  <CardMockup hero={hero} fallbackName={t.unnamed_card} />
                </Link>
                <Link href={heroHref} className="absolute -bottom-3 -left-2 sm:-left-6 rounded-2xl shadow-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 -rotate-2"
                  style={{ background: "#fff", border: "1px solid rgba(46,38,32,0.06)" }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--green)" }} />
                  <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap" style={{ color: "var(--text)" }}>{fill(t.badge_lastseen, { city: heroLastCity })} {heroLastFlag}</span>
                </Link>
                <Link href={heroHref} className="absolute -top-4 -right-2 sm:-right-6 rounded-2xl shadow-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 rotate-2"
                  style={{ background: "#fff", border: "1px solid rgba(46,38,32,0.06)" }}>
                  <MapPin size={12} style={{ color: "var(--accent)" }} />
                  <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap" style={{ color: "var(--text)" }}>{fill(t.badge_stops, { stops: heroStops, countries: heroCountries })}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div style={{ borderTop: "1px solid rgba(46,38,32,0.08)", borderBottom: "1px solid rgba(46,38,32,0.08)", background: "rgba(232,220,200,0.35)" }}>
          <div className="max-w-6xl mx-auto px-4 md:px-12 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif-display text-2xl md:text-3xl" style={{ color: "var(--text)" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live world map (Leaflet) */}
        <section id="map" className="max-w-6xl mx-auto px-4 md:px-12 pt-20 md:pt-24 w-full">
          <div className="mb-8 max-w-lg">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--accent)" }}>{t.map_label}</span>
            <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight" style={{ color: "var(--text)" }}>
              {t.map_title}
            </h2>
          </div>
        </section>
        <section className="max-w-6xl mx-auto px-4 md:px-12 w-full">
          <div style={{ height: 520, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(46,38,32,0.1)", position: "relative", zIndex: 0, isolation: "isolate" }}>
            <WorldMap entries={entries} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-4 md:px-12 py-20 md:py-28 w-full">
          <div className="mb-16 max-w-lg">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--accent)" }}>{t.how_label}</span>
            <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight" style={{ color: "var(--text)" }}>
              {t.how_title_1}<br />
              <span className="italic font-light">{t.how_title_2}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            {[
              { step: "01", icon: <Package size={22} style={{ color: "var(--accent)" }} />, title: t.step1_title, desc: t.step1_desc },
              { step: "02", icon: <MapPin size={22} style={{ color: "var(--accent)" }} />, title: t.step2_title, desc: t.step2_desc },
              { step: "03", icon: <Share2 size={22} style={{ color: "var(--accent)" }} />, title: t.step3_title, desc: t.step3_desc },
            ].map((item) => (
              <div key={item.step}>
                <div className="font-serif-display text-6xl font-bold mb-3 leading-none" style={{ color: "rgba(46,38,32,0.08)" }}>
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(198,107,69,0.10)" }}>
                  {item.icon}
                </div>
                <h3 className="font-serif-display text-xl mb-2" style={{ color: "var(--text)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dark section: featured cards */}
        {featured.length > 0 && (
          <section style={{ background: "var(--dark)" }} className="py-20 md:py-28">
            <div className="max-w-6xl mx-auto px-4 md:px-12">
              <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--accent)" }}>{t.live_label}</span>
                  <h2 className="font-serif-display text-3xl md:text-4xl mt-2 leading-tight" style={{ color: "var(--cream)" }}>
                    {t.live_title}
                  </h2>
                </div>
                <Link href="/leaderboard" className="text-sm transition-colors flex items-center gap-1.5" style={{ color: "rgba(232,220,200,0.7)" }}>
                  {t.live_viewboard}
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {featured.map((s) => (
                  <Link
                    key={s.card.id}
                    href={`/karte/${s.card.id}`}
                    className="text-left rounded-2xl border p-6 transition-all duration-200 block"
                    style={{ borderColor: "rgba(198,107,69,0.4)", background: "rgba(198,107,69,0.08)" }}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="font-serif-display text-xl" style={{ color: "#fff" }}>{s.card.card_name || t.unnamed_card}</div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0" style={{ color: "var(--green)", background: "rgba(107,122,79,0.2)" }}>
                        {fill(t.card_stops, { n: s.stops })}
                      </span>
                    </div>
                    {s.flags.length > 0 && (
                      <div className="text-2xl mb-4 flex gap-1">{s.flags.map((f, j) => <span key={j}>{f}</span>)}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{t.last_seen}</div>
                        <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                          {s.lastCity}{s.lastCountry ? `, ${s.lastCountry}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
                        {t.view_journey}
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA strip */}
        <section style={{ background: "var(--accent)" }} className="py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-serif-display text-3xl md:text-4xl leading-tight" style={{ color: "#fff" }}>
                {t.cta_title_1}<br />
                <span className="italic font-light">{t.cta_title_2}</span>
              </h2>
              <p className="text-sm mt-3 max-w-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                {t.cta_desc}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
                style={{ background: "#fff", color: "var(--accent)" }}>
                {t.cta_order}
              </Link>
              <a href="#map"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
                style={{ border: "2px solid rgba(255,255,255,0.4)", color: "#fff" }}>
                {t.cta_explore}
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(46,38,32,0.08)" }} className="py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-serif-display font-semibold" style={{ color: "var(--text)" }}>CarryOn</span>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.footer_tag}</p>
            <div className="flex gap-6">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>Instagram</a>
              )}
              <Link href="/impressum" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>{t.footer_imprint}</Link>
              <Link href="/datenschutz" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>{t.footer_privacy}</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
