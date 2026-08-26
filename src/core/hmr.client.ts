// Dev-only runtime, bootstrapped by @core/middleware/react. Holds an in-memory
// hash table of this page's chunks and re-imports the stale ones over a
// websocket, so edits land without a page reload.

const hashes: Record<string, string> = {};

const swap = async (path: string, hash: string) => {
  if (path.endsWith(".css")) {
    const link = document.querySelector<HTMLLinkElement>(`link[href^="${path}"]`);
    if (link) link.href = `${path}?h=${hash}`;
  } else {
    // re-running the entrypoint re-renders the root, see @core/utils/hydrate
    await import(`${path}?h=${hash}`);
  }

  console.log(`[hmr] ${path}`);
};

const connect = () => {
  const ws = new WebSocket(`ws://${location.host}/__hmr`);

  ws.onmessage = async ({ data }) => {
    const manifest: Record<string, string> = JSON.parse(data);

    for (const [path, hash] of Object.entries(manifest)) {
      if (!path.startsWith(window.__HMR__)) continue;

      const stale = hashes[path] && hashes[path] !== hash;
      hashes[path] = hash;
      if (stale) await swap(path, hash).catch(() => location.reload());
    }
  };

  ws.onclose = () => setTimeout(connect, 200);
};

connect();
