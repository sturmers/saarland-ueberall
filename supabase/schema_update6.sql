-- Card name and launch message (set by first finder)
alter table cards add column if not exists card_name text default '';
alter table cards add column if not exists launch_message text default '';
