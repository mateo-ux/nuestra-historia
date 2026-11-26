-- Tabla de canciones compartidas para "Siempre fuiste tú".
-- Pégalo completo en Supabase → SQL Editor → New query → Run.

create table if not exists public.canciones (
  id uuid primary key default gen_random_uuid(),
  url text not null check (url ~ '^(https://open\.spotify\.com/|spotify:)'),
  titulo text check (char_length(titulo) <= 120),
  de text check (char_length(de) <= 80),
  nota text check (char_length(nota) <= 200),
  creado timestamptz not null default now()
);

-- Seguridad (RLS): la página usa la clave pública "anon".
-- Cualquiera con el enlace de la página puede ver, agregar y quitar canciones,
-- pero no puede tocar nada más de la base de datos.
alter table public.canciones enable row level security;

drop policy if exists "ver canciones" on public.canciones;
create policy "ver canciones" on public.canciones for select to anon using (true);

drop policy if exists "agregar canciones" on public.canciones;
create policy "agregar canciones" on public.canciones for insert to anon with check (true);

drop policy if exists "quitar canciones" on public.canciones;
create policy "quitar canciones" on public.canciones for delete to anon using (true);

-- Tiempo real: avisa a la página cuando alguien agrega o quita una canción.
alter table public.canciones replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.canciones;
exception when duplicate_object then null;
end $$;
