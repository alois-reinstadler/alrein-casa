# @alrein-casa/web

Personal site: SvelteKit with `adapter-static`, Tailwind, mdsvex and Paraglide (en, es, de, tr, it).

```sh
pnpm --filter @alrein-casa/web dev
pnpm --filter @alrein-casa/web build   # output in apps/web/build
```

`BASE_PATH` sets the SvelteKit base path; the GitHub Pages workflow sets it to `/alrein-casa`.
Root `pnpm check` covers formatting, `svelte-check` and ESLint for this app.
