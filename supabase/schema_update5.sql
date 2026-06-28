-- Kommentar-Feld zu Einträgen hinzufügen
alter table entries add column if not exists comment text default '';
