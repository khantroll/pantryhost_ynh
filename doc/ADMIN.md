## Rex / Debian 12 compatibility

YunoHost 12.1 currently runs on Debian 12. The npm-distributed Rex 0.20.2 x64
binary can require glibc 2.39, which is newer than Debian 12.

This package therefore uses two Rex 0.20.2 binaries built from upstream source
using Rex upstream's own Bookworm Dockerfile:

- `rex-builder`: build-capable binary used only during install/upgrade.
- `rex`: runtime-only binary used by the systemd web service.

They are downloaded as YunoHost source resources and verified using SHA256.

No Docker daemon or Rust compiler is required on the YunoHost server.

## AI configuration

AI settings can be changed after installation from the YunoHost application
configuration panel. Saving the panel updates `.env` and restarts both services.

Upstream Pantry Host currently implements/documents Anthropic. Additional
providers shown by this experimental package require corresponding app-side
adapters.
