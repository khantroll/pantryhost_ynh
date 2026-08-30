# Pantry Host for YunoHost — ynh3 Bookworm Rex build

This revision works around the upstream npm Rex Linux binary requiring glibc
2.39 while YunoHost 12.1 / Debian 12 provides glibc 2.36.

Instead of Docker at runtime, this package uses Rex 0.20.2 binaries built
off-server from upstream Rex source using Rex's own Debian Bookworm Dockerfile.

## One-time bootstrap before installing ynh3

1. Push this revision to `khantroll/pantryhost_ynh`.
2. In GitHub, open **Actions → Build Rex 0.20.2 for Debian 12 → Run workflow**.
3. Wait for the workflow to finish.
4. Confirm it created release `rex-0.20.2-bookworm1`.
5. Confirm the workflow made a new commit named
   `Pin Bookworm Rex 0.20.2 binaries`.
6. Only then install Pantry Host from:
   `https://github.com/khantroll/pantryhost_ynh`

The workflow:
- checks out exactly Rex v0.20.2;
- builds using upstream Rex's own Bookworm Dockerfile;
- extracts both the build-capable and runtime-only binaries;
- verifies they run inside Debian 12;
- publishes them as GitHub Release assets;
- calculates SHA256 hashes;
- writes those SHA256 hashes into `manifest.toml`;
- commits the finalized manifest back to the repository.

The YunoHost server never installs Rust or Docker.

## AI GUI

The install form and application configuration panel expose:
- none
- Anthropic
- Gemini
- Mistral
- OpenAI-compatible

The GUI writes AI settings into `.env` and restarts the two Pantry Host services.

Important: upstream Pantry Host still implements/documents Anthropic only.
Gemini, Mistral, and OpenAI-compatible choices require the application-side
provider adapters before they become functional.
