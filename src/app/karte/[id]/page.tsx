"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Entry } from "@/lib/supabase";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

type CardData = {
  card: { id: string; created_at: string };
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

function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("de-DE")} km`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

function formatDays(days: number): string {
  if (days === 0) return "Selber Tag";
  if (days === 1) return "1 Tag";
  if (days < 30) return `${days} Tage`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 Monat" : `${months} Monate`;
}

export default function KartePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CardData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/card/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setData(d); });
  }, [id]);

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#fff" }}>
      <h1 className="text-3xl font-bold mb-3" style={{ letterSpacing: "-0.03em" }}>Card not found</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>The ID „{id}" doesn't exist.</p>
      <Link href="/" className="text-sm font-semibold underline" style={{ color: "var(--accent)" }}>Back to map</Link>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fff" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading…</p>
    </div>
  );

  const sorted = [...data.entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Total distance
  let totalKm = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.lat && prev.lng && curr.lat && curr.lng) {
      totalKm += haversineKm(prev.lat, prev.lng, curr.lat, curr.lng);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff" }}>
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Carry<span style={{ color: "var(--accent)" }}>On</span>
          </Link>
          <span className="text-xs font-mono px-2 py-1 rounded-md" style={{ background: "var(--cream-dark)", color: "var(--text-muted)" }}>
            #{id}
          </span>
        </div>
      </header>

      {/* Map */}
      {sorted.filter(e => e.lat).length > 0 && (
        <div style={{ height: 340, borderBottom: "1px solid var(--border)", position: "relative" }}>
          <WorldMap entries={data.entries} />
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full px-6 py-12">

        {/* Stats row */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-3 gap-px mb-12" style={{ background: "var(--border)" }}>
            {[
              { value: sorted.length, label: "Finds" },
              { value: totalKm > 0 ? formatKm(totalKm) : "—", label: "Total Distance" },
              {
                value: sorted.length > 1 ? formatDays(daysBetween(sorted[0].created_at, sorted[sorted.length - 1].created_at)) : "—",
                label: "Journey Duration"
              },
            ].map(s => (
              <div key={s.label} className="py-6 text-center" style={{ background: "#fff" }}>
                <p className="text-2xl font-bold mb-1" style={{ letterSpacing: "-0.03em" }}>{s.value}</p>
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Journey chain */}
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "var(--accent)" }}>
          Journey Chain
        </h2>

        {sorted.length === 0 ? (
          <div className="py-16 text-center" style={{ border: "1px solid var(--border)", borderRadius: 16 }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No finds yet — be the first!</p>
          </div>
        ) : (
          <ol className="relative">
            {sorted.map((entry, i) => {
              const prev = sorted[i - 1];
              const distKm = prev?.lat && prev?.lng && entry.lat && entry.lng
                ? haversineKm(prev.lat, prev.lng, entry.lat, entry.lng)
                : null;
              const days = prev ? daysBetween(prev.created_at, entry.created_at) : null;

              return (
                <li key={entry.id}>
                  {/* Leg info between stops */}
                  {i > 0 && (
                    <div className="flex items-center gap-4 py-4 ml-5">
                      <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)", flexShrink: 0 }} />
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {distKm !== null && (
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {formatKm(distKm)}
                          </span>
                        )}
                        {days !== null && (
                          <>
                            <span style={{ color: "var(--border)" }}>·</span>
                            <span>{formatDays(days)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stop */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: i === 0 ? "var(--accent)" : "var(--cream-dark)", color: i === 0 ? "#fff" : "var(--text)" }}>
                        {i + 1}
                      </div>
                    </div>
                    <div className="pb-2 flex-1 min-w-0">
                      <p className="font-bold text-base" style={{ letterSpacing: "-0.01em" }}>{entry.name}</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                        From {entry.home_location} · Found in <strong style={{ color: "var(--text)", fontWeight: 600 }}>{entry.location_name}</strong>
                      </p>
                      {entry.comment && (
                        <p className="text-sm mt-2 italic" style={{ color: "var(--text-muted)" }}>„{entry.comment}"</p>
                      )}
                      <p className="text-xs mt-1.5" style={{ color: "var(--border)" }}>
                        {new Date(entry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Hint for web visitors */}
        <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: "var(--cream-dark)" }}>
          <p className="text-sm font-medium mb-1">Found this card?</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Scan the QR code on the physical card to add your stop to the journey.
          </p>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex gap-8 text-xs" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-60 transition-opacity">World Map</Link>
          <Link href="/impressum" className="hover:opacity-60 transition-opacity">Impressum</Link>
          <Link href="/datenschutz" className="hover:opacity-60 transition-opacity">Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
}
