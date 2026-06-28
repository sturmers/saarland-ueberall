-- Saarländer weltweit – Datenbankschema
-- In Supabase unter SQL Editor ausführen

-- Tabelle: Karten (jede physische Karte mit QR-Code)
create table if not exists cards (
  id          text primary key,           -- z.B. "abc123" aus dem QR-Code
  created_at  timestamptz default now()
);

-- Tabelle: Einträge (jeder Scan/Eintrag auf einer Karte)
create table if not exists entries (
  id            uuid primary key default gen_random_uuid(),
  card_id       text not null references cards(id) on delete cascade,
  name          text not null,            -- eingetragener Name
  location_name text not null,            -- Freitext-Ort, z.B. "Sydney, Australien"
  lat           double precision,         -- optionaler GPS-Breitengrad
  lng           double precision,         -- optionaler GPS-Längengrad
  created_at    timestamptz default now()
);

-- Index für schnelle Abfragen per Karte
create index if not exists entries_card_id_idx on entries(card_id);

-- Row Level Security: alle dürfen lesen und einfügen (kein Login nötig)
alter table cards  enable row level security;
alter table entries enable row level security;

create policy "Karten lesbar für alle"     on cards  for select using (true);
create policy "Einträge lesbar für alle"   on entries for select using (true);
create policy "Einträge einfügen für alle" on entries for insert with check (true);
-- Karten werden nur per Service-Role-Key erstellt (Admin-Skript), kein öffentliches Insert
