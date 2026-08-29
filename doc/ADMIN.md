## Important packaging notes

Pantry Host should be installed on a dedicated domain such as
`pantry.example.org`, at `/`.

The GraphQL service uses fixed local port 4001 because Pantry Host 0.7.0
hardcodes `localhost:4001` for server-side rendering. The port is not
opened in the firewall; nginx exposes GraphQL as `/graphql` over the
normal YunoHost HTTPS endpoint.

The package currently tracks Pantry Host's upstream `main` branch because
upstream does not provide a stable tagged source archive for 0.7.0. Before
submitting this package to the YunoHost catalog, switch to a checksum-pinned
`resources.sources.main` archive.

Persistent data:
- SQLite: `$data_dir/pantry.db`
- uploads: `$data_dir/uploads`
- UI settings overrides: `$data_dir/settings-overrides.json`
