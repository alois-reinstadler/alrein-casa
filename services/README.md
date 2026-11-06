# services

Docker Compose definitions for self-hosted family services on the family VPS. Empty scaffold:
nothing is defined or deployed yet. Full decision record: `docs/ROADMAP.md` (Family VPS).

Planned services:

| Service     | Version  | Hostname             | Login                               |
| ----------- | -------- | -------------------- | ----------------------------------- |
| Pocket ID   | v2.19.x  | `id.alrein.casa`     | Passkeys (the family SSO)           |
| Vaultwarden | ≥ 1.37.5 | `vault.alrein.casa`  | SSO via Pocket ID + master password |
| Immich      |          | `photos.alrein.casa` | OIDC via Pocket ID                  |
| LibreChat   |          | `chat.alrein.casa`   | OIDC via Pocket ID                  |

- LibreChat: one OpenRouter key, family budget about €20/month, plus per-person limits.
- Home Assistant is not hosted here. It stays at home and is reached over the tailnet later.
- Supporting containers: Cloudflare tunnel connector (`cloudflared`) and Alloy for logs and
  metrics.

Rules for when this gets built:

- Traffic comes in only through the dedicated Cloudflare tunnel; no published host ports.
- Admin areas (Vaultwarden `/admin`, Pocket ID admin, Immich and LibreChat admin) are for Alois
  only: blocked publicly, reachable over the tailnet.
- Each service gets a nightly database dump that the restic backup picks up.
- No secrets in the repo. Commit `.env.example` with variable names only; real values come from
  the `alrein-family` Infisical project at runtime.
- These run on the family VPS (`infra/`), never on ar2k infrastructure.
