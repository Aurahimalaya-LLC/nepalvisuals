-- Migrate tours table: remove guide_language, convert duration and tour_type to numeric
begin;

-- 1) Add temporary numeric columns
alter table public.tours add column if not exists duration_days integer;
alter table public.tours add column if not exists tour_type_code integer;

-- 2) Populate temporary columns from existing data
update public.tours
set duration_days = nullif(regexp_replace(coalesce(duration, ''), '\\D', '', 'g'), '')::int
where duration_days is null;

update public.tours
set tour_type_code = case
  when tour_type = 'Group' then 1
  when tour_type = 'Private' then 2
  else null
end
where tour_type_code is null;

-- 3) Drop old columns and rename temporaries
alter table public.tours drop column if exists guide_language;

-- Replace duration (text) with integer
alter table public.tours drop column if exists duration;
alter table public.tours rename column duration_days to duration;
alter table public.tours alter column duration type integer using duration;

-- Replace tour_type (text) with integer and add constraint
alter table public.tours drop column if exists tour_type;
alter table public.tours rename column tour_type_code to tour_type;
alter table public.tours alter column tour_type type integer using tour_type;
alter table public.tours
  add constraint tour_type_range check (tour_type is null or (tour_type >= 1 and tour_type <= 9));

commit;
