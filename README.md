# Pantry Host for YunoHost

Experimental YunoHost packaging for Pantry Host 0.7.0.

## Install

Host this directory in a Git repository, then install it with:

```bash
sudo yunohost app install https://github.com/YOURUSER/pantryhost_ynh --debug
```

Use a dedicated domain, for example `pantry.example.org`.

## Current status

This package is intended for testing on YunoHost 12.1+.
It follows upstream `main` until Pantry Host publishes a stable tag/archive
that can be checksum-pinned in the YunoHost manifest.
