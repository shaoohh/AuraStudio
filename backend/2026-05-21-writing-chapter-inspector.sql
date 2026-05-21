alter table writing_chapters
  add column if not exists review_checklist jsonb not null default '[]'::jsonb,
  add column if not exists next_actions jsonb not null default '[]'::jsonb;
