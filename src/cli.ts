import net from "node:net";
import { a2sInfo } from "./a2s.js";

function usage(): never {
  console.error(`Usage: node dist/cli.js [options] <host:port> [host:port...]

Options:
  --quiet              One-line summary
  --max-latency-ms <n> Mark ok:false when latency exceeds threshold`);
  process.exit(1);
}

const raw = process.argv.slice(2);
let quiet = false;
let maxLatencyMs: number | null = null;
const targets: string[] = [];

for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (a === "--quiet") quiet = true;
  else if (a === "--max-latency-ms") {
    maxLatencyMs = Number(raw[++i]);
    if (!Number.isFinite(maxLatencyMs) || maxLatencyMs <= 0) {
      console.error("Invalid --max-latency-ms");
      process.exit(1);
    }
  } else if (a === "--help" || a === "-h") usage();
  else targets.push(a);
}

if (targets.length === 0) targets.push("127.0.0.1:27015");

async function tcpOpen(host: string, port: number, ms = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const s = net.connect({ host, port }, () => { s.destroy(); resolve(true); });
    s.on("error", () => resolve(false));
    setTimeout(() => { s.destroy(); resolve(false); }, ms);
  });
}

async function checkOne(target: string) {
  const [host, portStr] = target.split(":");
  const port = Number(portStr || 27015);
  const started = Date.now();
  const tcp = await tcpOpen(host, port);
  let a2s: Awaited<ReturnType<typeof a2sInfo>> | null = null;
  try { a2s = await a2sInfo(host, port); } catch { /* offline query */ }
  const latencyMs = Date.now() - started;
  let ok = tcp;
  if (maxLatencyMs != null && latencyMs > maxLatencyMs) ok = false;
  return { ok, host, port, latencyMs, a2s, target };
}

const results = [];
for (const t of targets) results.push(await checkOne(t));

const failed = results.filter((r) => !r.ok).length;

if (quiet) {
  const ok = results.length - failed;
  console.log(`${ok}/${results.length} ok · ${failed} failed`);
} else {
  console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
}

process.exit(failed > 0 ? 1 : 0);
