# infra

Infrastructure for the family VPS: Pulumi for provisioning, Ansible for host configuration.
Empty scaffold: Claude on the host fills this in later. Full decision record:
`docs/ROADMAP.md` (Family VPS).

Decided:

- **Host:** Hetzner Cloud CX33 in its own Hetzner Cloud project `alrein-family`.
- **Secrets:** its own Infisical project. No credentials in the repo.
- **Network:** no open inbound ports. Admin over Tailscale only. Headscale stays on the dev
  machine `hetzner-main`.
- **Public access:** a dedicated Cloudflare tunnel for `id`, `vault`, `photos` and `chat` on
  `alrein.casa`, without Cloudflare Access for the apps. A Cloudflare rule blocks the admin
  pages publicly; Alois reaches them over the tailnet (or via Access with Pocket ID as IdP,
  Alois only).
- **Configuration:** Ansible baseline like ar2k prod, with its own inventory and credentials.
- **Backups:** nightly database dumps plus restic to the Storage Box sub-account `family`;
  monthly restore check.
- **Observability:** Alloy for logs and metrics; external uptime checks.
- **Mail:** Brevo as the family mail sender.

Boundaries:

- Family infrastructure only. It is separate from the ar2k business and never part of the
  ar2k platform or its accounts.
