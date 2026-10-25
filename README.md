# YGuard Server Health

Probe CS2 dedicated nodes over **A2S_INFO** / TCP and emit a simple health JSON for Uptime Kuma or the panel.

## Features

- Multiple `host:port` targets → JSON array
- Exit `1` if any fail (CI-friendly)
- `--quiet` one-line summary
- `--max-latency-ms` threshold

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) (current **1.1.0**).

```bash
npm i && npm run build
node dist/cli.js 127.0.0.1:27015 127.0.0.1:27016
node dist/cli.js --quiet --max-latency-ms 800 10.0.0.5:27015
```

MIT · [@kianPk](https://github.com/kianPk)
