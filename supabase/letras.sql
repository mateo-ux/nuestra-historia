-- Letras de las canciones (para el botón "Letra" del reproductor).
-- Pégalo en Supabase → SQL Editor → New query → Run. Se puede correr varias veces.

alter table public.canciones
  add column if not exists letra text check (char_length(letra) <= 10000);

-- Permite editar solo la letra desde la página.
revoke update on public.canciones from anon;
grant update (letra) on public.canciones to anon;
drop policy if exists "editar letras" on public.canciones;
create policy "editar letras" on public.canciones for update to anon using (true) with check (true);
