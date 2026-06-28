"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import type { Entry } from "@/lib/supabase";

type CardWithEntries = {
  id: string;
  write_token: string;
  created_at: string;
  entries: Entry[];
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  // Karten
  const [cards, setCards] = useState<CardWithEntries[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  // Karten erstellen
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [newCards, setNewCards] = useState<{ id: string; write_token: string; view_url: string; write_url: string; qr: string | null }[]>([]);
  const [genError, setGenError] = useState("");

  // Settings
  const [instagram, setInstagram] = useState("");
  const [savingInstagram, setSavingInstagram] = useState(false);
  const [instagramSaved, setInstagramSaved] = useState(false);

  // Passwort ändern
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Tab
  const [tab, setTab] = useState<"cards" | "create" | "settings">("cards");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) { setAuthError("Bitte Admin-Passwort eingeben."); return; }
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: secret }),
    });
    if (!res.ok) { setAuthError("Falsches Passwort."); return; }
    await loadCards();
    setAuthed(true);
    const s = await fetch("/api/settings").then(r => r.json());
    setInstagram(s.instagram_url ?? "");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (newPw !== newPw2) { setPwError("Die neuen Passwörter stimmen nicht überein."); return; }
    if (newPw.length < 8) { setPwError("Mindestens 8 Zeichen erforderlich."); return; }
    setSavingPw(true);
    const res = await fetch("/api/admin/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    });
    const json = await res.json();
    if (!res.ok) { setPwError(json.error ?? "Fehler."); setSavingPw(false); return; }
    // Neues Passwort für weitere API-Calls merken
    setSecret(newPw);
    setCurrentPw(""); setNewPw(""); setNewPw2("");
    setPwSuccess(true);
    setSavingPw(false);
  }

  async function loadCards() {
    setLoadingCards(true);
    const res = await fetch("/api/admin/cards", { headers: { Authorization: `Bearer ${secret}` } });
    const json = await res.json();
    setCards(json.cards ?? []);
    setLoadingCards(false);
  }

  async function deleteCard(id: string) {
    if (!confirm(`Karte #${id} wirklich löschen? Alle Einträge gehen verloren.`)) return;
    await fetch(`/api/card/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${secret}` } });
    setCards(prev => prev.filter(c => c.id !== id));
  }

  async function generateCards() {
    setGenerating(true);
    setGenError("");
    setNewCards([]);
    const res = await fetch("/api/admin/create-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ count }),
    });
    if (!res.ok) { const j = await res.json(); setGenError(j.error ?? "Fehler"); setGenerating(false); return; }
    const json = await res.json();
    const initial = json.cards.map((c: { id: string; write_token: string; view_url: string; write_url: string }) => ({
      ...c, qr: null,
    }));
    setNewCards(initial);
    setGenerating(false);
    // QR-Codes laden
    const updated = await Promise.all(
      initial.map(async (c: { id: string; write_token: string; view_url: string; write_url: string; qr: null }) => {
        const r = await fetch(`/api/admin/qr?token=${c.write_token}`);
        const j = await r.json();
        return { ...c, qr: j.qr };
      })
    );
    setNewCards(updated);
    await loadCards();
  }

  async function saveInstagram() {
    setSavingInstagram(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ instagram_url: instagram }),
    });
    setSavingInstagram(false);
    setInstagramSaved(true);
    setTimeout(() => setInstagramSaved(false), 2000);
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
        <form onSubmit={login} className="rounded-2xl border p-8 w-full max-w-sm space-y-4"
          style={{ background: "#fff", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Logo size={36} color="var(--accent)" />
            <div>
              <p className="font-semibold text-sm">Admin-Bereich</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nur für Administratoren</p>
            </div>
          </div>
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
            placeholder="Admin-Passwort"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ border: "1.5px solid var(--border)", background: "var(--cream)" }} />
          {authError && <p className="text-xs" style={{ color: "#991B1B" }}>{authError}</p>}
          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Einloggen
          </button>
          <Link href="/" className="block text-center text-xs underline" style={{ color: "var(--text-muted)" }}>
            Zur Website
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between"
        style={{ background: "#fff", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <Logo size={30} color="var(--accent)" />
          <span className="font-semibold text-sm">Admin</span>
        </div>
        <Link href="/" className="text-xs underline" style={{ color: "var(--text-muted)" }}>Website ansehen</Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
          {(["cards", "create", "settings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderColor: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "var(--accent)" : "var(--text-muted)",
              }}>
              {t === "cards" ? `Alle Karten (${cards.length})` : t === "create" ? "Neue Karten" : "Einstellungen"}
            </button>
          ))}
        </div>

        {/* TAB: Alle Karten */}
        {tab === "cards" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Aktive Karten</h2>
              <button onClick={loadCards} className="text-xs underline" style={{ color: "var(--text-muted)" }}>
                {loadingCards ? "Lädt…" : "Aktualisieren"}
              </button>
            </div>
            {cards.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Noch keine Karten erstellt.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {cards.map(card => (
                  <div key={card.id} className="rounded-2xl border p-5"
                    style={{ background: "#fff", borderColor: "var(--border)" }}>
                    {/* Karten-Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-sm">Karte #{card.id}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          Erstellt {new Date(card.created_at).toLocaleDateString("de-DE")} ·{" "}
                          {card.entries.length} Finder
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/karte/${card.id}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg border"
                          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                          Ansehen
                        </a>
                        <button onClick={() => deleteCard(card.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-red-50"
                          style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
                          Löschen
                        </button>
                      </div>
                    </div>

                    {/* Finder-Liste */}
                    {card.entries.length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Noch nicht gefunden.</p>
                    ) : (
                      <ol className="space-y-2">
                        {card.entries
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map((entry, i) => (
                            <li key={entry.id} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                                style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                                {i + 1}
                              </span>
                              <div>
                                <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{entry.name}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  aus {entry.home_location} · gefunden in {entry.location_name}
                                </p>
                              </div>
                            </li>
                          ))}
                      </ol>
                    )}

                    {/* Links & QR */}
                    <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold w-16 flex-shrink-0" style={{ color: "var(--text-muted)" }}>Ansehen</span>
                        <a href={`/karte/${card.id}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline truncate" style={{ color: "var(--text-muted)" }}>
                          /karte/{card.id}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold w-16 flex-shrink-0" style={{ color: "var(--accent)" }}>QR-Ziel</span>
                        <a href={`/scan/${card.write_token}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-mono underline truncate" style={{ color: "var(--text)" }}>
                          /scan/{card.write_token}
                        </a>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <a href={`/api/admin/qr?token=${card.write_token}&format=svg`}
                          download={`karte-${card.id}.svg`}
                          className="text-xs underline" style={{ color: "var(--accent)" }}>
                          QR-Code (SVG)
                        </a>
                        <a href={`/api/admin/qr?token=${card.write_token}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: "var(--text-muted)" }}>
                          QR-Code (PNG)
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Neue Karten erstellen */}
        {tab === "create" && (
          <div className="max-w-2xl">
            <h2 className="font-semibold mb-6">Neue Karten erstellen</h2>
            <div className="rounded-2xl border p-6 mb-6" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <div className="flex gap-4 items-end flex-wrap">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Anzahl Karten
                  </label>
                  <input type="number" min={1} max={200} value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    className="w-24 rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1.5px solid var(--border)", background: "var(--cream)" }} />
                </div>
                <button onClick={generateCards} disabled={generating}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "#fff", opacity: generating ? 0.6 : 1 }}>
                  {generating ? "Erstelle…" : "Karten erstellen"}
                </button>
                {newCards.length > 0 && (
                  <button onClick={() => window.print()}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                    Alle drucken
                  </button>
                )}
              </div>
              {genError && <p className="text-xs mt-3" style={{ color: "#991B1B" }}>{genError}</p>}
            </div>

            {/* QR-Gitter */}
            {newCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newCards.map(card => (
                  <div key={card.id} className="rounded-2xl border p-4 text-center print-page"
                    style={{ background: "#fff", borderColor: "var(--border)" }}>
                    {card.qr
                      ? <img src={card.qr} alt={`QR ${card.id}`} className="w-36 h-36 mx-auto" />
                      : <div className="w-36 h-36 mx-auto rounded-xl animate-pulse" style={{ background: "var(--cream-dark)" }} />
                    }
                    <p className="text-xs font-mono mt-2" style={{ color: "var(--text-muted)" }}>#{card.id}</p>
                    <a href={`/api/admin/qr?token=${card.write_token}&format=svg`}
                      download={`karte-${card.id}.svg`}
                      className="text-xs underline mt-1 block" style={{ color: "var(--accent)" }}>
                      SVG herunterladen
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Einstellungen */}
        {tab === "settings" && (
          <div className="max-w-xl">
            <h2 className="font-semibold mb-6">Einstellungen</h2>
            <div className="rounded-2xl border p-6" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-muted)" }}>
                Instagram-URL
              </label>
              <div className="flex gap-3">
                <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/deinprofil"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ border: "1.5px solid var(--border)", background: "var(--cream)" }} />
                <button onClick={saveInstagram} disabled={savingInstagram}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
                  style={{ background: "var(--accent)", color: "#fff" }}>
                  {instagramSaved ? "Gespeichert" : "Speichern"}
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Erscheint in der Navigation und im Footer der Website.
              </p>
            </div>

            {/* Passwort ändern */}
            <form onSubmit={changePassword} className="rounded-2xl border p-6 mt-4" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-4 text-sm">Admin-Passwort ändern</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Aktuelles Passwort
                  </label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1.5px solid var(--border)", background: "var(--cream)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Neues Passwort
                  </label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1.5px solid var(--border)", background: "var(--cream)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Neues Passwort wiederholen
                  </label>
                  <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1.5px solid var(--border)", background: "var(--cream)" }} />
                </div>
                {pwError && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#FEE2E2", color: "#991B1B" }}>{pwError}</p>}
                {pwSuccess && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#D1FAE5", color: "#065F46" }}>Passwort erfolgreich geändert.</p>}
                <button type="submit" disabled={savingPw}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "#fff", opacity: savingPw ? 0.6 : 1 }}>
                  {savingPw ? "Wird gespeichert…" : "Passwort ändern"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
