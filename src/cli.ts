import net from "node:net";
import { a2sInfo } from "./a2s.js";

const target = process.argv[2] || "127.0.0.1:27015";
const [host, portStr] = target.split(":");
const port = Number(portStr || 27015);

async function tcpOpen(host: string, port: number, ms = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const s = net.connect({ host, port }, () => { s.destroy(); resolve(true); });
    s.on("error", () => resolve(false));
    setTimeout(() => { s.destroy(); resolve(false); }, ms);
  });
}

const started = Date.now();
const tcp = await tcpOpen(host, port);
let a2s: Awaited<ReturnType<typeof a2sInfo>> | null = null;
try { a2s = await a2sInfo(host, port); } catch { /* offline query */ }

const out = {
  ok: tcp,
  host, port,
  latencyMs: Date.now() - started,
  a2s
};
console.log(JSON.stringify(out, null, 2));
process.exit(tcp ? 0 : 1);
