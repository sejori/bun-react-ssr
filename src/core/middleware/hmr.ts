import { manifest } from "../utils/build";

// `bun --watch` restarts the process (and so rebuilds the client) on every
// source change, which drops these sockets. The runtime reconnects and reads
// the fresh manifest, so a connect *is* the update notification.
export const hmrHandler = (request: Bun.BunRequest, server: Bun.Server<any>) =>
  server.upgrade(request)
    ? undefined
    : new Response("Upgrade failed", { status: 400 });

export const hmrWebsocket: Bun.WebSocketHandler = {
  open: (ws) => ws.send(JSON.stringify(manifest)),
};
