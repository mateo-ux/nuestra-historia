-- Permite editar desde la página el enlace, el título, de quién es y la
-- dedicatoria de cada canción (además de la letra).
-- Pégalo en Supabase → SQL Editor → New query → Run. Se puede correr varias veces.

revoke update on public.canciones from anon;
grant update (url, titulo, de, nota, letra) on public.canciones to anon;
drop policy if exists "editar letras" on public.canciones;
drop policy if exists "editar canciones" on public.canciones;
create policy "editar canciones" on public.canciones for update to anon using (true) with check (true);
