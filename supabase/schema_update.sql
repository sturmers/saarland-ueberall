-- Update: neue Felder für Einträge + Settings-Tabelle
-- Im Supabase SQL Editor ausführen

-- Neues Feld: Heimatort (wo kommt die Person her?)
alter table entries add column if not exists home_location text not null default '';

-- "location_name" bleibt als "Fundort" (wo wurde die Karte gefunden)

-- Settings-Tabelle (Instagram-Link etc.)
create table if not exists settings (
  key   text primary key,
  value text not null default ''
);

alter table settings enable row level security;
create policy "Settings lesbar für alle" on settings for select using (true);

-- Startwert für Instagram
insert into settings (key, value) values ('instagram_url', '') on conflict (key) do nothing;
