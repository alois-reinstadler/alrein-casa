# Roadmap

Alois' notes on where alrein-casa is heading. Nothing here is built yet.

## Principle

Family infrastructure is separate from the ar2k business. It is never part of the ar2k
platform, its accounts, its hosting or its credentials.

## apps/web: family help section

The personal site gets a section where family members can get help: how-tos, links to the family
services, and how to reach Alois.

## apps/hub: family home hub

A home hub where the family can ask AI assistants questions.

- Consider self-hosted LibreChat (`services/`) as the assistant backend.
- Per-person accounts with their own usage budgets.
- Home Assistant context, so assistants can answer questions about the house. Home Assistant
  stays at home and is reached over the tailnet later.
- Links into the other family services (Pocket ID, Vaultwarden, Immich, Home Assistant).

## More family apps

More custom family apps later, each as its own `apps/*` workspace.

## Family VPS (decided, not built)

Alois' decisions. `services/` and `infra/` hold the Compose files and provisioning once built;
Claude on the host builds the infra.

### Host and access

- Hetzner Cloud CX33 in its own Hetzner Cloud project `alrein-family`.
- Its own Infisical project for secrets. Nothing shared with ar2k.
- No open inbound ports. Admin access over Tailscale only.
- Headscale (the tailnet control server) stays on the dev machine `hetzner-main`, not on the
  family VPS.

### Apps

| App         | Purpose               | Public hostname      | Login                               |
| ----------- | --------------------- | -------------------- | ----------------------------------- |
| Pocket ID   | Passkey SSO (v2.19.x) | `id.alrein.casa`     | Passkeys                            |
| Vaultwarden | Passwords (≥ 1.37.5)  | `vault.alrein.casa`  | SSO via Pocket ID + master password |
| Immich      | Photos and videos     | `photos.alrein.casa` | OIDC via Pocket ID                  |
| LibreChat   | AI assistants         | `chat.alrein.casa`   | OIDC via Pocket ID                  |

- `vault` and `photos` keep these names so the phone apps keep working.
- LibreChat uses one OpenRouter key with a family budget of about €20/month, plus per-person
  limits.
- No Home Assistant on the VPS. It stays at home and is reachable over the tailnet later.

### Exposure

- Public through a dedicated Cloudflare tunnel. No Cloudflare Access in front of the apps.
- Admin pages are for Alois only: Vaultwarden `/admin`, the Pocket ID admin, and the Immich and
  LibreChat admin areas. A Cloudflare rule blocks them publicly. They are reachable only over
  the tailnet, or through Cloudflare Access with Pocket ID as IdP, restricted to Alois.

### Operations

- Ansible baseline like ar2k prod (same pattern, separate inventory and credentials).
- Nightly database dumps plus restic to the Storage Box sub-account `family`.
- Monthly restore check.
- Alloy for logs and metrics.
- External uptime checks.
- Brevo as the family mail sender.

## Hosting

- `services/`: Docker Compose for the family services.
- `infra/`: Pulumi + Ansible for the family VPS.
- Move `apps/web` off GitHub Pages so the repo can go private; see
  `docs/cloudflare-workers-plan.md`.
