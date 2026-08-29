Pantry Host is a self-hosted Progressive Web App for pantry inventory,
recipes, cookware, grocery lists and meal planning.

This YunoHost package runs the Rex frontend and GraphQL API as separate
systemd services and presents both through one YunoHost HTTPS domain.
SQLite data, uploaded images and Settings UI overrides are kept in the
YunoHost app data directory and included in backups.
