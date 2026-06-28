-- Admin-Passwort als Hash in Settings speichern
-- Startwert: "saarland123" (wird beim ersten Login automatisch gesetzt)
insert into settings (key, value) values ('admin_password_hash', '') on conflict (key) do nothing;
