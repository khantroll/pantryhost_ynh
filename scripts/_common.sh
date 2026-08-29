#!/bin/bash

upstream_repo="https://github.com/jpdevries/pantry-host.git"
upstream_branch="main"

setup_persistent_paths() {
    mkdir -p "$data_dir/uploads"

    # Pantry Host writes user uploads inside the application tree.
    rm -rf "$install_dir/packages/app/public/uploads"
    ln -s "$data_dir/uploads" "$install_dir/packages/app/public/uploads"

    # Settings changed in Pantry Host's Settings UI must survive upgrades.
    touch "$data_dir/settings-overrides.json"
    rm -f "$install_dir/packages/app/.settings-overrides.json"
    ln -s "$data_dir/settings-overrides.json" \
          "$install_dir/packages/app/.settings-overrides.json"

    chown -R "$app:$app" "$data_dir"
    chown -h "$app:$app" \
        "$install_dir/packages/app/public/uploads" \
        "$install_dir/packages/app/.settings-overrides.json"
}

install_dependencies_and_build() {
    pushd "$install_dir"

    # Keep install deterministic relative to the upstream lockfile.
    ynh_exec_as_app npm ci

    # Match the upstream Docker build.
    ynh_exec_as_app npm run build --workspace=packages/app

    popd
}
