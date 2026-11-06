# alrein-casa

Personal and family monorepo for the Reinstadler household. It is separate from the ar2k
business and is never part of the ar2k platform.

## Layout

| Path        | What                                                           |
| ----------- | -------------------------------------------------------------- |
| `apps/web`  | Personal site (SvelteKit, static), deployed to GitHub Pages    |
| `apps/hub`  | Family home hub (scaffold only)                                |
| `services/` | Docker Compose for self-hosted family services (scaffold only) |
| `infra/`    | Pulumi + Ansible for the family VPS (scaffold only)            |
| `docs/`     | Plans and roadmap                                              |

## Tooling

pnpm workspaces + Turborepo. Toolchain versions are pinned in `mise.toml` (Node, pnpm, just)
and `packageManager` in `package.json`.

```sh
mise install   # Node, pnpm and just at the pinned versions
pnpm install
pnpm dev       # run apps/web
pnpm check     # the gate: prettier, svelte-check and eslint across all workspaces
pnpm build
```

`just` mirrors these (`just check`, `just dev`, ...). CI runs `pnpm check` and a build on
every pull request.
