"use client";

import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import type { Entry } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";

const CARD_COLORS = [
  "#B45309", "#2563EB", "#059669", "#7C3AED",
  "#DB2777", "#0891B2", "#D97706", "#DC2626",
  "#65A30D", "#9333EA",
];

function colorForCard(cardId: string): string {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = cardId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

type Props = {
  entries: Entry[];
};

export default function WorldMap({ entries }: Props) {
  const byCard = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    if (!acc[e.card_id]) acc[e.card_id] = [];
    acc[e.card_id].push(e);
    return acc;
  }, {});

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      style={{ height: "100%", width: "100%", minHeight: 480 }}
      scrollWheelZoom
      // Welt nur einmal anzeigen
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />

      {Object.entries(byCard).map(([cardId, cardEntries]) => {
        const color = colorForCard(cardId);
        const coords = cardEntries
          .filter((e) => e.lat !== null && e.lng !== null)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((e) => [e.lat!, e.lng!] as [number, number]);

        return (
          <span key={cardId}>
            {coords.length > 1 && (
              <Polyline
                positions={coords}
                pathOptions={{ color, weight: 2, opacity: 0.6, dashArray: "6 4" }}
              />
            )}
            {cardEntries
              .filter((e) => e.lat !== null && e.lng !== null)
              .map((entry, i) => (
                <CircleMarker
                  key={entry.id}
                  center={[entry.lat!, entry.lng!]}
                  radius={i === 0 ? 6 : 9}
                  pathOptions={{ color: "#fff", fillColor: color, fillOpacity: 0.9, weight: 2 }}
                >
                  <Popup>
                    <strong style={{ fontSize: 13 }}>{entry.name}</strong>
                    <br />
                    <span style={{ color: "#78716C", fontSize: 12 }}>
                      Gefunden in {entry.location_name}
                    </span>
                    {entry.home_location && (
                      <>
                        <br />
                        <span style={{ color: "#78716C", fontSize: 12 }}>
                          Aus {entry.home_location}
                        </span>
                      </>
                    )}
                    <br />
                    <a href={`/karte/${entry.card_id}`} style={{ color: "#B45309", fontSize: 12 }}>
                      Reisekette ansehen →
                    </a>
                  </Popup>
                </CircleMarker>
              ))}
          </span>
        );
      })}
    </MapContainer>
  );
}
