-- Tabelle für Einreichungs-Fingerprints (verhindert Mehrfach-Einträge)
create table if not exists submission_locks (
  id          uuid primary key default gen_random_uuid(),
  card_id     text not null references cards(id) on delete cascade,
  fingerprint text not null,
  created_at  timestamptz default now(),
  unique (card_id, fingerprint)
);

alter table submission_locks enable row level security;
-- Kein öffentliches Lesen oder Schreiben – nur über API (service role)
