# Plan: move apps/web from GitHub Pages to Cloudflare Workers static assets

Status: plan only. Nothing is deployed, no Cloudflare resources or tokens exist yet.

## Why

The repo should become private. GitHub Pages on a free account only publishes public repos, so
the site needs another host first. Workers static assets serves a prebuilt directory for free
and works the same whether the repo is public or private.

## Target setup

- Keep `@sveltejs/adapter-static`. Its `apps/web/build` output is uploaded as-is.
- An assets-only Worker (no script) configured in `apps/web/wrangler.jsonc`:

  ```jsonc
  {
  	"name": "alrein-casa-web",
  	"compatibility_date": "<date of the move>",
  	"assets": {
  		"directory": "./build",
  		"html_handling": "auto-trailing-slash",
  		"not_found_handling": "404-page"
  	}
  }
  ```

- `404-page` needs a `build/404.html`; adapter-static only writes one when `fallback: '404.html'`
  is set, so add that in the same change (or drop `not_found_handling`).
- Build with an empty `BASE_PATH` (the site is served from the domain root, not `/alrein-casa`).
- `wrangler` added as a pinned devDependency of `apps/web`, with a `deploy` script
  (`wrangler deploy`).
- Deploy from GitHub Actions on push to `master` after `pnpm check`, using
  `cloudflare/wrangler-action`. Credentials: a Cloudflare API token scoped to
  "Workers Scripts: Edit" on the family account, plus the account ID, stored in Infisical and
  synced to GitHub Actions secrets. Never committed.

## Steps

1. Create or pick the family Cloudflare account (not the ar2k account).
2. Add `wrangler.jsonc`, the `deploy` script and the deploy workflow on a branch. Deploy once to
   the `*.workers.dev` URL and check the landing page, theme toggle, locales and assets.
3. Attach the custom domain to the Worker (DNS change: needs Alois' approval).
4. Remove `.github/workflows/deploy-pages.yml` and disable GitHub Pages in the repo settings.
5. Make the repo private.

## Decisions for Alois

- Which domain the site should live on.
- Which Cloudflare account owns it (must be separate from ar2k).
- Whether `*.workers.dev` stays enabled after the custom domain works.
