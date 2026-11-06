# infra

Infrastructure for the family VPS: Pulumi for provisioning, Ansible for host configuration.
Empty scaffold: Claude on the host fills this in later.

Boundaries:

- Family infrastructure only. It is separate from the ar2k business and never part of the
  ar2k platform or its accounts.
- No credentials in the repo; they come from the secret store at runtime.
