# services

Docker Compose definitions for self-hosted family services. Empty scaffold: nothing is
defined or deployed yet.

Planned services:

- **Vaultwarden**: family password manager.
- **Immich**: family photo and video library.
- **LibreChat**: AI assistants for the family, with per-person budgets.
- **Home Assistant**: linked from the hub, not necessarily hosted here (it usually lives on
  the home network).

Rules for when this gets built:

- No secrets in the repo. Commit `.env.example` with variable names only; inject real values
  at runtime.
- These run on the family VPS (`infra/`), never on ar2k infrastructure.
