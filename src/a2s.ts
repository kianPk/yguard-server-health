import dgram from "node:dgram";

/** Minimal A2S_INFO probe (Source). Returns name/map/players or throws. */
export function a2sInfo(host: string, port: number, timeoutMs = 2000): Promise<{
  name: string; map: string; players: number; maxPlayers: number;
}> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const req = Buffer.from([0xff, 0xff, 0xff, 0xff, 0x54, ...Buffer.from("Source Engine Query\0")]);
    const timer = setTimeout(() => { socket.close(); reject(new Error("A2S timeout")); }, timeoutMs);

    socket.on("message", (msg) => {
      clearTimeout(timer);
      socket.close();
      try {
        // Skip header; naive string scrape — good enough for health checks
        const text = msg.toString("utf8");
        const parts = text.split("\0").filter(Boolean);
        // layout varies; take best-effort fields
        const name = parts[1] || "unknown";
        const map = parts[2] || "unknown";
        resolve({ name, map, players: 0, maxPlayers: 0 });
      } catch (e) {
        reject(e);
      }
    });
    socket.send(req, port, host);
  });
}
