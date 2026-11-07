-- Pro Tips: short, individual tips about a place (e.g. "Great cold brew",
-- "Go early"), stored one per array element so each can be shown on its own.
-- Replaces the free-form user_note text.
alter table pins add column if not exists pro_tips text[] not null default '{}';

-- Carry over existing notes, one tip per non-empty line
update pins
set pro_tips = coalesce(
  (
    select array_agg(btrim(line, E' \t\r') order by ord)
    from unnest(regexp_split_to_array(user_note, E'\r?\n')) with ordinality as t(line, ord)
    where btrim(line, E' \t\r') <> ''
  ),
  '{}'
)
where user_note is not null
  and trim(user_note) <> ''
  and pro_tips = '{}';

-- user_note is left in place for now: the create_pin function still writes it.
-- Drop it in a later migration once nothing reads or writes it.
