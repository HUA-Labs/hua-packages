# Agent Instructions

## Repository Role

This repository is the public package projection and release boundary for
HUA Labs packages. It is not a parallel product-development workspace.

## Platform-First Product Authority

- Package product code, tests, `doc.yaml`, generated README/AI documentation,
  handwritten `DETAILED_GUIDE.md`, and product-bearing `package.json` fields
  must be implemented, reviewed, and landed in `HUA-Labs/HUA-platform` first.
- Product-bearing manifest fields include package identity, exports, types,
  files, bins, engines, scripts, dependencies, peers, optional dependencies,
  and publish configuration.
- A public product PR must be a complete byte-exact projection from one named,
  already-landed platform commit/tree. Record the exact projected path roster.
- If platform and public bytes diverge, or a branch is based on stale public
  authority, stop and open a bounded platform mission. Do not hand-reconcile
  the product bytes or treat this repository as the newer authority.

## Mirror-Local Scope

- Mirror allowlists, repository-only checks, release-plan metadata, and
  workflows are eligible only when a separately assigned bounded mirror task
  explicitly includes them.
- Mirror-local work must not silently change package product behavior or
  promote public-preserved bytes into product authority.
- Preserve unrelated worktrees, branches, stashes, and dirty changes.

## Version, Merge, and Publication Gates

- Version and Changeset work starts only after exact source projection and the
  package README/Detailed Guide gates are independently reviewed clean.
- A Changeset, release plan, successful workflow, npm visibility, or package
  access setting is not publication authority by itself.
- PR merge authority belongs to the tower/operator after independent clean
  review. Worker agents report merge readiness and stop.
- npm publication, provenance/OIDC use, credentials, access changes, tags,
  deprecation, and deployment require Devin's separate explicit approval.
