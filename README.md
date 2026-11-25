# Siempre fuiste tú 💛

Página regalo para María Fernanda, hecha con Next.js.

## Cambiar textos y fotos

Todo el contenido está en **`datos/contenido.ts`**: nombres, fecha de inicio del contador,
capítulos, fotos, razones, cartas "Ábrela cuando…" y la carta secreta.

- Fotos optimizadas: `public/optimizado/fotos/` (webp, ~1600 px).
- Páginas del libro: `public/optimizado/revista/pagina-0.webp` … `pagina-10.webp`.
- Los originales (`public/fotos`, `public/Revista`) no se tocaron y **no se suben a Git**
  porque pesan casi 9 GB (ver `.gitignore`). La página solo usa la carpeta `optimizado`.

## Música

Pon una canción en `public/musica/nuestra-cancion.mp3`. Si no existe, el botón de música no aparece.

## Secretos de la página

- Toca la **luna** de la portada 5 veces: aparece una carta secreta.
- En el final, el botón "No" se escapa. 😜

## Probar y publicar

```bash
npm run dev       # http://localhost:3000
npm run build     # comprobar antes de publicar
```

Para publicar: sube el proyecto a un repositorio de GitHub e impórtalo en vercel.com (Add New → Project).
