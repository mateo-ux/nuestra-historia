-- Grabaciones de voz de la escena del zorro y la conejita (zanahoria
-- grabadora) y de Flash. Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Crea: un "bucket" público de Storage llamado "voces" para los audios y una
-- tabla "voces" que dice cuál audio va en cada renglón.

-- 1) Bucket de audios: público para escuchar, máximo 3 MB por audio y solo audio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('voces', 'voces', true, 3145728, array['audio/mp4', 'audio/aac', 'audio/x-m4a', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Permisos del bucket: la página (clave pública "anon") puede subir y borrar
-- audios, pero solo dentro de "voces".
drop policy if exists "voces: ver" on storage.objects;
create policy "voces: ver" on storage.objects for select to anon using (bucket_id = 'voces');

drop policy if exists "voces: subir" on storage.objects;
create policy "voces: subir" on storage.objects for insert to anon with check (bucket_id = 'voces');

drop policy if exists "voces: borrar" on storage.objects;
create policy "voces: borrar" on storage.objects for delete to anon using (bucket_id = 'voces');

-- 2) Tabla: una fila por renglón grabado.
create table if not exists public.voces (
  clave text primary key check (clave in ('zanahoria-1', 'zanahoria-2', 'flash-lento', 'flash-normal')),
  ruta text not null check (char_length(ruta) <= 200),
  actualizado timestamptz not null default now()
);

alter table public.voces enable row level security;

drop policy if exists "ver voces" on public.voces;
create policy "ver voces" on public.voces for select to anon using (true);

drop policy if exists "grabar voces" on public.voces;
create policy "grabar voces" on public.voces for insert to anon with check (true);

drop policy if exists "regrabar voces" on public.voces;
create policy "regrabar voces" on public.voces for update to anon using (true) with check (true);

drop policy if exists "borrar voces" on public.voces;
create policy "borrar voces" on public.voces for delete to anon using (true);

grant select, insert, update, delete on public.voces to anon;

-- Tiempo real: si ella graba su renglón, a ti te aparece sin recargar.
alter table public.voces replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.voces;
exception when duplicate_object then null;
end $$;
