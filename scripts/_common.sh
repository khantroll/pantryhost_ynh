#!/bin/bash

# Pantry Host upstream is not currently tagged consistently enough for us to
# rely on a versioned source archive here, so this experimental package still
# clones upstream main. The Rex compatibility binaries themselves ARE pinned.
upstream_repo="https://github.com/jpdevries/pantry-host.git"
upstream_branch="main"

setup_persistent_paths() {
    mkdir -p "$data_dir/uploads"
    rm -rf "$install_dir/packages/app/public/uploads"
    ln -s "$data_dir/uploads" "$install_dir/packages/app/public/uploads"

    touch "$data_dir/settings-overrides.json"
    rm -f "$install_dir/packages/app/.settings-overrides.json"
    ln -s "$data_dir/settings-overrides.json" \
          "$install_dir/packages/app/.settings-overrides.json"

    chown -R "$app:$app" "$data_dir"
    chown -h "$app:$app" \
        "$install_dir/packages/app/public/uploads" \
        "$install_dir/packages/app/.settings-overrides.json"
}

setup_bookworm_rex() {
    local rex_stage="$install_dir/.ynh-rex"
    mkdir -p "$rex_stage" "$install_dir/bin"

    # YunoHost downloads and SHA256-verifies these declared manifest sources.
    ynh_setup_source --dest_dir="$rex_stage/builder" --source_id="rex_builder"
    ynh_setup_source --dest_dir="$rex_stage/runtime" --source_id="rex_runtime"

    install -m 0755 "$rex_stage/builder/rex-builder" "$install_dir/bin/rex-builder"
    install -m 0755 "$rex_stage/runtime/rex-runtime" "$install_dir/bin/rex"
    chown "$app:$app" "$install_dir/bin/rex-builder" "$install_dir/bin/rex"
}

install_dependencies_and_build() {
    pushd "$install_dir"
    ynh_exec_as_app npm ci

    # Do NOT use node_modules/@limlabs/rex-linux-x64/bin/rex here.
    # The npm binary currently requires glibc 2.39. Our replacement is built
    # from exactly Rex 0.20.2 using Rex upstream's own Bookworm Dockerfile.
    ynh_exec_as_app "$install_dir/bin/rex-builder" build --root "$install_dir/packages/app"
    popd
}
