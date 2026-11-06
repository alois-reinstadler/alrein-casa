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
- Home Assistant context, so assistants can answer questions about the house.
- Links into the other family services (Vaultwarden, Immich, Home Assistant).

## More family apps

More custom family apps later, each as its own `apps/*` workspace.

## Hosting

- `services/`: Docker Compose for the family services.
- `infra/`: Pulumi + Ansible for the family VPS.
- Move `apps/web` off GitHub Pages so the repo can go private; see
  `docs/cloudflare-workers-plan.md`.
