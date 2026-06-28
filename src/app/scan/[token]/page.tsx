"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Logo from "@/components/Logo";
import Link from "next/link";
import type { Entry } from "@/lib/supabase";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

type CardData = {
  card: { id: string; created_at: string };
  entries: Entry[];
};

export default function ScanPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<CardData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const [name, setName] = useState("");
  const [homeLocation, setHomeLocation] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadCard() {
    const res = await fetch(`/api/scan/${token}`);
    if (res.status === 404) { setNotFound(true); return; }
    setData(await res.json());
  }

  useEffect(() => {
    loadCard();
    // Dieses Gerät hat bereits eingetragen wenn localStorage-Eintrag vorhanden
    const lock = localStorage.getItem(`submitted_${token}`);
    if (lock) {
      // Prüfen ob inzwischen jemand anderes eingetragen hat (dann darf man wieder)
      fetch(`/api/scan/${token}`)
        .then(r => r.json())
        .then(json => {
          const entries = json.entries ?? [];
          const lockTime = Number(lock);
          const newerEntry = entries.find(
            (e: { created_at: string }) => new Date(e.created_at).getTime() > lockTime
          );
          setCanSubmit(!!newerEntry);
        });
    }
  }, [token]);

  async function requestGps() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=de`,
            { headers: { "User-Agent": "saarlaender-weltweit/1.0" } }
          );
          const json = await res.json();
          const addr = json.address;
          const city = addr.city || addr.town || addr.village || addr.county || addr.state || "";
          const country = addr.country || "";
          if (city || country) setFoundLocation([city, country].filter(Boolean).join(", "));
        } catch { /* manuell eintragen */ }
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !homeLocation.trim() || !foundLocation.trim()) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/scan/${token}/entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, home_location: homeLocation, location_name: foundLocation, lat, lng }),
    });
    if (!res.ok) {
      const j = await res.json();
      if (j.error === "already_submitted") {
        setCanSubmit(false);
      } else {
        setError(j.error ?? "Fehler beim Speichern.");
      }
      setSubmitting(false);
      return;
    }
    localStorage.setItem(`submitted_${token}`, String(Date.now()));
    setCanSubmit(false);
    setSubmitted(true);
    await loadCard();
    setSubmitting(false);
  }

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "var(--cream)" }}>
      <Logo size={48} color="var(--accent)" />
      <h1 className="text-2xl font-bold mt-6 mb-2">Ungültiger QR-Code</h1>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Dieser QR-Code ist nicht gültig oder wurde deaktiviert.</p>
      <Link href="/" className="mt-6 text-sm underline" style={{ color: "var(--accent)" }}>Zur Startseite</Link>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
      <p style={{ color: "var(--text-muted)" }}>Lädt…</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>
      <header className="border-b px-4 py-3 flex items-center justify-between" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <Link href="/" className="flex items-center gap-2">
          <Logo size={30} color="var(--accent)" />
          <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>Saarländer weltweit</span>
        </Link>
        <Link href={`/karte/${data.card.id}`} className="text-xs underline" style={{ color: "var(--text-muted)" }}>
          Nur ansehen
        </Link>
      </header>

      {/* Anleitung */}
      <div className="mx-4 mt-4 rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>
          Du hast diese Karte gefunden!
        </p>
        <ol className="space-y-2">
          {[
            "Trag deinen Namen und deinen Ort unten ein – du wirst Teil der Reisekette.",
            "Gib die Karte weiter: Hinterlass sie an einem öffentlichen Ort, z. B. an einem Auto mit Saarland-Kennzeichen, in einem Café oder beim nächsten Saarländer, dem du begegnest.",
            "Verfolge online, wohin die Karte als nächstes reist.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Minikarte */}
      {data.entries.filter(e => e.lat).length > 0 && (
        <div className="mx-4 mt-4 rounded-xl overflow-hidden border" style={{ height: 200, borderColor: "var(--border)" }}>
          <WorldMap entries={data.entries} />
        </div>
      )}

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Bisherige Kette */}
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
            Bisherige Reisekette
          </h2>
          {data.entries.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Noch keine Einträge – sei die erste Person!</p>
          ) : (
            <ol className="relative border-l-2 pl-6 space-y-6" style={{ borderColor: "var(--border)" }}>
              {data.entries.map((entry, i) => (
                <li key={entry.id} className="relative">
                  <div className="absolute -left-[26px] w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent)", borderColor: "var(--accent)", color: "#fff", top: 2 }}>
                    {i + 1}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{entry.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    aus {entry.home_location} · gefunden in {entry.location_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {new Date(entry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Formular */}
        {!canSubmit ? (
          <div className="rounded-2xl p-6 text-center border" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--accent-light)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>Du hast dich bereits eingetragen.</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Du hast dich schon eingetragen. Gib die Karte weiter – sobald jemand anderes sie gefunden hat, kannst du dich erneut eintragen.
            </p>
            <Link href="/" className="inline-block mt-4 text-sm underline" style={{ color: "var(--accent)" }}>
              Alle Fundorte auf der Weltkarte ansehen
            </Link>
          </div>
        ) : submitted ? (
          <div className="rounded-2xl p-6 text-center border" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--accent-light)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>Eintrag gespeichert!</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Du bist jetzt Teil der Reisekette.</p>
            <Link href="/" className="inline-block mt-4 text-sm underline" style={{ color: "var(--accent)" }}>
              Alle Fundorte auf der Weltkarte ansehen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <h2 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Trag dich ein</h2>
            <div className="space-y-4">
              <Field label="Dein Name" id="name" value={name} onChange={setName} placeholder="z. B. Marie Müller" />
              <Field label="Dein Heimatort" id="home" value={homeLocation} onChange={setHomeLocation} placeholder="z. B. Saarbrücken, Deutschland" />
              <div>
                <Field label="Wo hast du die Karte gefunden?" id="found" value={foundLocation} onChange={setFoundLocation} placeholder="z. B. Sydney, Australien" />
                <button type="button" onClick={requestGps} className="text-xs underline mt-1.5"
                  style={{ color: lat !== null ? "var(--accent)" : "var(--text-muted)" }}>
                  {gpsLoading ? "GPS wird abgerufen…" : lat !== null ? "Standort gesetzt – Feld ggf. anpassen" : "Standort automatisch ermitteln (optional)"}
                </button>
              </div>
              {error && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#FEE2E2", color: "#991B1B" }}>{error}</p>
              )}
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#fff", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Wird gespeichert…" : "Eintragen"}
              </button>
            </div>
          </form>
        )}
      </div>

      <footer className="mt-auto px-4 py-4 text-center text-xs border-t" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <Link href="/impressum" className="underline mr-4">Impressum</Link>
        <Link href="/datenschutz" className="underline">Datenschutz</Link>
      </footer>
    </div>
  );
}

function Field({ label, id, value, onChange, placeholder }: {
  label: string; id: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
        style={{ border: "1.5px solid var(--border)", background: "var(--cream)", color: "var(--text)" }}
        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
        onBlur={e => (e.target.style.borderColor = "var(--border)")} />
    </div>
  );
}
