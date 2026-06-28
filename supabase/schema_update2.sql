-- Geheimen Write-Token zu jeder Karte hinzufügen
alter table cards add column if not exists write_token text unique;

-- Bestehende Karten bekommen einen temporären Token (werden ohnehin neu erstellt)
update cards set write_token = gen_random_uuid()::text where write_token is null;

-- Spalte als Pflichtfeld setzen
alter table cards alter column write_token set not null;

-- Index für schnelle Token-Suche
create unique index if not exists cards_write_token_idx on cards(write_token);
