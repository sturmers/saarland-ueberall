# Saarländer weltweit – Setup-Anleitung

## 1. Node.js installieren

Lade Node.js LTS herunter und installiere es:  
https://nodejs.org/de  
→ Nach der Installation Terminal neu starten.

Prüfen mit: `node --version` (sollte v20 oder höher zeigen)

---

## 2. Supabase-Datenbank einrichten

1. Kostenloses Konto auf https://supabase.com anlegen
2. Neues Projekt erstellen (Region: Frankfurt für DE)
3. Im Projekt: **SQL Editor** öffnen
4. Inhalt von `supabase/schema.sql` einfügen und ausführen
5. Unter **Settings → API** die folgenden Werte kopieren:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Umgebungsvariablen setzen

```bash
# .env.local.example kopieren:
copy .env.local.example .env.local
```

Dann `.env.local` öffnen und die Werte aus Schritt 2 eintragen.  
`ADMIN_SECRET` → eigenes sicheres Passwort wählen (z.B. `mein-geheimes-pw-2024`)

---

## 4. Abhängigkeiten installieren & App starten

```bash
npm install
npm run dev
```

App läuft dann auf http://localhost:3000

---

## 5. Erste Karten erstellen

1. http://localhost:3000/admin öffnen
2. Admin-Secret aus `.env.local` eingeben
3. Anzahl Karten wählen → **Karten erstellen**
4. QR-Codes erscheinen → **Alle drucken / PDF** → ausdrucken & laminieren

---

## 6. Auf Vercel deployen (kostenlos)

```bash
npm install -g vercel
vercel
```

→ Vercel fragt nach Login und Projekt-Einstellungen.  
→ Danach unter **Settings → Environment Variables** alle Werte aus `.env.local` eintragen.

---

## Seiten-Übersicht

| URL | Funktion |
|-----|----------|
| `/` | Startseite |
| `/karte/[id]` | QR-Code-Zielseite (Eintragen + Kette ansehen) |
| `/weltkarte` | Interaktive Weltkarte aller Fundorte |
| `/admin` | Admin: Karten erstellen + QR-Codes drucken |

## API-Endpunkte

| Endpunkt | Methode | Funktion |
|----------|---------|----------|
| `/api/card/[id]` | GET | Karte + Einträge |
| `/api/card/[id]/entry` | POST | Neuen Eintrag speichern |
| `/api/entries` | GET | Alle GPS-Einträge für Weltkarte |
| `/api/admin/create-cards` | POST | Neue Karten-IDs anlegen |
| `/api/admin/qr?id=xxx` | GET | QR-Code als Bild |
