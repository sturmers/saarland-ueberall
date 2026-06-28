"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Entry } from "@/lib/supabase";

// Leaflet darf nicht serverseitig gerendert werden
const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

export default function WeltkartePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((json) => {
        setEntries(json.entries ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-lg leading-tight">🌍 Saarländer weltweit</h1>
          <p className="text-xs text-gray-500">
            {loading ? "Lädt…" : `${entries.length} Fundorte auf der Karte`}
          </p>
        </div>
        <a
          href="/"
          className="text-sm text-blue-600 underline"
        >
          Startseite
        </a>
      </header>

      {/* Karte */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 animate-pulse">
            Karte wird geladen…
          </div>
        ) : (
          <WorldMap entries={entries} />
        )}
      </div>

      {/* Footer-Info */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2 text-xs text-gray-400 text-center flex-shrink-0">
        Nur Einträge mit GPS-Koordinaten werden angezeigt. Klicke auf einen Punkt für Details.
      </footer>
    </main>
  );
}
