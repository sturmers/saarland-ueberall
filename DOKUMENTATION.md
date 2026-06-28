# Saarländer weltweit – Dokumentation

> Physische Sammelkarten mit QR-Code reisen um die Welt. Finder scannen den Code, tragen sich ein und verfolgen die Reiseroute auf einer Weltkarte.

**Live-URL:** https://saarland-ueberall.vercel.app

---

## Inhaltsverzeichnis

1. [Konzept](#1-konzept)
2. [Architektur-Überblick](#2-architektur-überblick)
3. [Dienste & Zugänge](#3-dienste--zugänge)
4. [Datenbank](#4-datenbank)
5. [URL-Struktur](#5-url-struktur)
6. [Seiten & Komponenten](#6-seiten--komponenten)
7. [API-Routen](#7-api-routen)
8. [Admin-Bereich](#8-admin-bereich)
9. [Sicherheit & Datenschutz](#9-sicherheit--datenschutz)
10. [Deployment](#10-deployment)
11. [Neue Karten erstellen](#11-neue-karten-erstellen)
12. [Datenbank-Migrationen](#12-datenbank-migrationen)
13. [Lokale Entwicklung](#13-lokale-entwicklung)

---

## 1. Konzept

Saarland-gebrandete Karten werden in der Welt verteilt. Jede Karte hat einen aufgedruckten QR-Code. Wer die Karte findet:

1. Scannt den QR-Code mit dem Smartphone
2. Trägt Namen, Heimatort und Fundort (per Stadtsuche oder GPS) ein
3. Hinterlässt optional einen persönlichen Text (max. 280 Zeichen)
4. Gibt die Karte weiter
5. Verfolgt über den Tracking-Link, wohin die Karte als nächstes reist

Auf der Startseite ist eine **Weltkarte** zu sehen, auf der alle Fundorte aller Karten mit farbigen Punkten und verbindenden Linien eingezeichnet sind.

---

## 2. Architektur-Überblick

```
┌─────────────────────────────────────────────────┐
│  Next.js 14 App Router (TypeScript + Tailwind)  │
│  Hosting: Vercel (Auto-Deploy via GitHub)        │
└───────────────┬─────────────────────────────────┘
                │ Supabase-JS Client
┌───────────────▼─────────────────────────────────┐
│  Supabase (PostgreSQL + Row Level Security)      │
│  Tabellen: cards, entries, submission_locks,     │
│            settings                              │
└─────────────────────────────────────────────────┘

Externe APIs (kostenlos, kein Key nötig):
  • Nominatim (OpenStreetMap) – Stadtsuche & Reverse Geocoding
  • Leaflet / OpenStreetMap – Kartenanzeige
```

**Tech-Stack:**

| Bereich | Technologie |
|---------|-------------|
| Framework | Next.js 14 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS + CSS-Variablen |
| Datenbank | Supabase (PostgreSQL) |
| Karte | react-leaflet / Leaflet.js |
| QR-Codes | npm-Paket `qrcode` |
| IDs | `nanoid` |
| Hosting | Vercel |
| Quellcode | GitHub: sturmers/saarland-ueberall |

---

## 3. Dienste & Zugänge

### Vercel
- **URL:** https://vercel.com
- **Projekt:** saarland-ueberall
- **Funktion:** Hosting & automatisches Deployment bei jedem GitHub-Push
- **Wichtige Umgebungsvariable:** `NEXT_PUBLIC_BASE_URL=https://saarland-ueberall.vercel.app`

### Supabase
- **URL:** https://supabase.com
- **Funktion:** Datenbank (PostgreSQL) + Authentifizierung der API-Schlüssel
- **Umgebungsvariablen:**
  - `NEXT_PUBLIC_SUPABASE_URL` – Projekt-URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – öffentlicher Schlüssel (beginnt mit `sb_publishable_`)
  - `SUPABASE_SERVICE_ROLE_KEY` – geheimer Service-Schlüssel (beginnt mit `sb_secret_`)

### GitHub
- **Repo:** https://github.com/sturmers/saarland-ueberall
- **Funktion:** Quellcode-Verwaltung; jeder Push auf `main` löst ein Vercel-Deployment aus

---

## 4. Datenbank

### Tabelle: `cards`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | text (PK) | 8-stellige nanoid – öffentliche Karten-ID (in URLs) |
| `write_token` | text (unique) | 16-stellige nanoid – geheimes Token im QR-Code |
| `created_at` | timestamptz | Erstellungsdatum |

### Tabelle: `entries`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | uuid (PK) | Automatisch generiert |
| `card_id` | text (FK → cards.id) | Zugehörige Karte |
| `name` | text | Name des Finders |
| `location_name` | text | Fundort (Stadtname, z. B. „Sydney, Australien") |
| `home_location` | text | Heimatort des Finders |
| `comment` | text | Persönlicher Text (optional, max. 280 Zeichen) |
| `lat` | float8 | GPS-Breitengrad (immer vorhanden) |
| `lng` | float8 | GPS-Längengrad (immer vorhanden) |
| `created_at` | timestamptz | Zeitpunkt des Eintrags |

### Tabelle: `submission_locks`

Verhindert Mehrfach-Einträge desselben Geräts auf derselben Karte (server-seitig).

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | uuid (PK) | |
| `card_id` | text (FK → cards.id) | |
| `fingerprint` | text | SHA-256 Hash aus `card_id:IP:User-Agent` |
| `created_at` | timestamptz | Zeitpunkt des letzten Eintrags |

Unique Constraint auf `(card_id, fingerprint)`.

### Tabelle: `settings`

Key-Value-Store für App-Einstellungen.

| `key` | Beschreibung |
|-------|--------------|
| `admin_password_hash` | SHA-256 Hash des Admin-Passworts (`saarlaender-weltweit:PASSWORT`) |
| `instagram_url` | Instagram-Link in der Navigation |

---

## 5. URL-Struktur

| URL | Zugriff | Beschreibung |
|-----|---------|--------------|
| `/` | öffentlich | Startseite mit Weltkarte aller Fundorte |
| `/karte/[id]` | öffentlich | Reiseroute einer einzelnen Karte (nur lesen) |
| `/scan/[write_token]` | nur via QR-Code | Eintrag-Formular (schreiben) |
| `/admin` | Passwort-geschützt | Admin-Bereich |
| `/impressum` | öffentlich | Impressum |
| `/datenschutz` | öffentlich | Datenschutzerklärung |

**Warum zwei URLs pro Karte?**  
`/karte/[id]` ist die öffentliche Tracking-Seite – sie kann geteilt werden, erlaubt aber kein Eintragen. `/scan/[write_token]` ist die QR-Code-Ziel-URL – sie ist geheim und nur im Admin-Bereich sichtbar. So können Finder die Karte nur über den physischen QR-Code beschreiben.

---

## 6. Seiten & Komponenten

### Seiten (`src/app/`)

**`page.tsx`** – Startseite  
Server-Komponente. Lädt alle Einträge mit Koordinaten und zeigt sie auf der Weltkarte.

**`scan/[token]/page.tsx`** – Scan-Seite  
Client-Komponente. Kernseite der App:
- Zeigt Reisekette der Karte
- Stadtsuche mit Autocomplete (Nominatim-Such-API) → liefert immer Koordinaten
- GPS-Button als Alternative (mit Reverse Geocoding für Ortsname)
- Eintragen-Button deaktiviert ohne Koordinaten
- Permanente Einmal-Sperre pro Gerät & Karte (localStorage + server-seitig)
- Nach Submit: Bestätigung + kopierbarer Tracking-Link

**`karte/[id]/page.tsx`** – Karten-Ansicht  
Client-Komponente. Zeigt Reisekette und Mini-Karte. Kein Formular – nur zum Verfolgen.

**`admin/page.tsx`** – Admin-Bereich  
Drei Tabs: Karten, Statistiken, Einstellungen.
- Tab „Karten": Liste aller Karten, View-URL, Write-URL, QR-Code (SVG/PNG Download)
- Tab „Statistiken": Einträge nach Karte
- Tab „Einstellungen": Instagram-URL, Admin-Passwort ändern

### Komponenten (`src/components/`)

**`WorldMap.tsx`**  
Leaflet-Karte mit:
- Farbigen Markern pro Karte (8 Farben, per Hash zugewiesen)
- Polylinien, die Fundorte einer Karte chronologisch verbinden
- `noWrap={true}` + `maxBounds` damit die Weltkarte nicht wiederholt wird

**`Logo.tsx`** – SVG-Saarland-Silhouette  
**`Nav.tsx`** – Navigation mit Instagram-Link aus Settings  
**`HomeClient.tsx`** – Client-Wrapper für Startseite (wegen Leaflet SSR)

---

## 7. API-Routen

### `GET /api/scan/[token]`
Gibt Karte + Einträge zurück. Keine Fingerprint-Prüfung (nur bei POST).  
Antwort: `{ card: { id, created_at }, entries: Entry[] }`

### `POST /api/scan/[token]/entry`
Speichert neuen Eintrag.  
- Prüft Fingerprint (IP + User-Agent) → 409 bei Duplikat
- Pflichtfelder: `name`, `location_name`, `home_location`, `lat`, `lng`
- Optional: `comment`

### `GET /api/card/[id]`
Gibt Karte + Einträge per öffentlicher Karten-ID zurück (für `/karte/[id]`).

### `POST /api/admin/auth`
Admin-Login. Vergleicht SHA-256-Hash mit `settings.admin_password_hash`.

### `PUT /api/admin/auth`
Admin-Passwort ändern. Erfordert aktuelles Passwort.

### `POST /api/admin/create-cards`
Erstellt neue Karten mit einzigartigen IDs.  
Body: `{ count: number }`  
Antwort: `{ created: number, cards: [{ id, write_token, view_url, write_url }] }`

### `GET /api/admin/qr?token=[write_token]&format=[svg|png]`
Generiert QR-Code für den Write-Link einer Karte.

---

## 8. Admin-Bereich

Erreichbar unter `/admin`. Login mit Admin-Passwort.

**Karten erstellen:**
1. Tab „Karten" öffnen
2. Anzahl eingeben → „Karten erstellen"
3. Pro Karte erscheinen: View-URL, Write-URL, QR-Code-Download (SVG + PNG)

**QR-Code drucken:**  
SVG-Download empfohlen (verlustfrei skalierbar). Den QR-Code auf die physische Karte drucken oder aufkleben. Der QR-Code zeigt auf `/scan/[write_token]`.

**Passwort ändern:**  
Tab „Einstellungen" → Aktuelles + neues Passwort eingeben.

**Instagram-Link ändern:**  
Tab „Einstellungen" → URL eintragen.

---

## 9. Sicherheit & Datenschutz

### Mehrfach-Eintrag-Schutz (zweistufig)

1. **Client-seitig (localStorage):** Nach erfolgreichem Eintrag wird `submitted_[token]` im Browser gespeichert. Die Sperre ist permanent und wird nie zurückgesetzt.
2. **Server-seitig (Fingerprint):** SHA-256 aus `card_id + IP-Adresse + User-Agent` wird in `submission_locks` gespeichert. Auch bei gelöschtem localStorage ist ein Zweit-Eintrag nicht möglich.

### Datenschutz
- IP-Adressen werden **nur als Hash** gespeichert, nicht im Klartext
- Kein Tracking, keine Cookies (außer technisch notwendigen)
- Datenschutzerklärung unter `/datenschutz` beschreibt die IP-Hashing-Praxis

### Admin-Passwort
- Wird als `SHA-256("saarlaender-weltweit:" + Passwort)` in der Datenbank gespeichert
- Nie im Klartext gespeichert

### QR-Code-Sicherheit
- Write-Token (16 Zeichen nanoid, ~95 Bit Entropie) ist geheim – nur im Admin-Bereich sichtbar
- Öffentliche Karten-ID (8 Zeichen) erlaubt nur Lesen, nie Schreiben

---

## 10. Deployment

**Automatisch:** Jeder Push auf den `main`-Branch in GitHub löst ein Vercel-Deployment aus. Nach ca. 1–2 Minuten ist die neue Version live.

**Manuell (falls nötig):**
1. Vercel-Dashboard öffnen → Projekt → „Redeploy"

**Umgebungsvariablen in Vercel** (einmalig einrichten):

| Variable | Wo zu finden |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_BASE_URL` | `https://saarland-ueberall.vercel.app` |

---

## 11. Neue Karten erstellen

1. `/admin` öffnen und einloggen
2. Tab „Karten" → Anzahl Karten eingeben → „Erstellen"
3. QR-Code (SVG) herunterladen und auf die physische Karte drucken
4. Karte verteilen!

**Wichtig:** Die Write-URL (`/scan/[token]`) ist der QR-Code-Ziel-Link. Niemals öffentlich teilen – nur der aufgedruckte QR-Code soll darauf verweisen. Die View-URL (`/karte/[id]`) kann frei geteilt werden.

---

## 12. Datenbank-Migrationen

Alle SQL-Änderungen liegen unter `supabase/`. Bei Änderungen am Datenbankschema:

1. SQL-Datei in `supabase/` anlegen (z. B. `schema_update6.sql`)
2. In Supabase → SQL Editor ausführen
3. Datei committen (für Dokumentationszwecke)

**Bisherige Migrationen:**

| Datei | Inhalt |
|-------|--------|
| `schema_update1.sql` | Initiales Schema: cards, entries, settings |
| `schema_update2.sql` | `submission_locks`-Tabelle |
| `schema_update3.sql` | `write_token`-Spalte zu cards |
| `schema_update4.sql` | Instagram-Setting, Admin-Passwort-Hash |
| `schema_update5.sql` | `comment`-Spalte zu entries |

---

## 13. Lokale Entwicklung

**Voraussetzungen:** Node.js (v18+), Git

```bash
# Repository klonen
git clone https://github.com/sturmers/saarland-ueberall.git
cd saarland-ueberall

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen anlegen
# Datei .env.local erstellen mit:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Entwicklungsserver starten
npm run dev
# → http://localhost:3000
```

**Änderungen deployen:**
```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
# Vercel deployt automatisch
```

---

## Projektstruktur

```
saarland-ueberall/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Startseite (Weltkarte)
│   │   ├── layout.tsx                  # Root-Layout, Fonts, Nav
│   │   ├── globals.css                 # CSS-Variablen, Basis-Styles
│   │   ├── scan/[token]/page.tsx       # QR-Code-Scan-Seite (schreiben)
│   │   ├── karte/[id]/page.tsx         # Karten-Tracking-Seite (lesen)
│   │   ├── admin/page.tsx              # Admin-Bereich
│   │   ├── impressum/page.tsx          # Impressum
│   │   ├── datenschutz/page.tsx        # Datenschutzerklärung
│   │   └── api/
│   │       ├── scan/[token]/route.ts           # GET Karte per Token
│   │       ├── scan/[token]/entry/route.ts     # POST Eintrag
│   │       ├── card/[id]/route.ts              # GET Karte per ID
│   │       ├── admin/auth/route.ts             # Login / Passwort
│   │       ├── admin/create-cards/route.ts     # Karten erstellen
│   │       └── admin/qr/route.ts               # QR-Code generieren
│   ├── components/
│   │   ├── WorldMap.tsx                # Leaflet-Weltkarte
│   │   ├── Logo.tsx                    # Saarland-Silhouette SVG
│   │   ├── Nav.tsx                     # Navigation
│   │   └── HomeClient.tsx              # Client-Wrapper Startseite
│   └── lib/
│       └── supabase.ts                 # Supabase-Client + Typen
├── supabase/                           # SQL-Migrationen
├── public/                             # Statische Dateien
├── DOKUMENTATION.md                    # Diese Datei
└── SETUP.md                            # Ersteinrichtungs-Anleitung
```

---

*Erstellt: Juni 2026 · stefan@stuermer.de*
