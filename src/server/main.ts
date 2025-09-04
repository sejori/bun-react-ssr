import { fileHandler } from "./file/handlers/file.hander";
import { homeHandler } from "./ssr/handlers/home.handler";
import { aboutHandler } from "./ssr/handlers/about.handler";

const port = process.env.PORT || 7777;
const isDev = process.env.ENV === "dev";

if (isDev) {
  const { Glob } = await import("bun");
  const clientPath = new URL("../client/", import.meta.url);
  const clientEntryGlob = new Glob("**/*.client.ts");
  const clientEntryPaths: string[] = [];
  for await (const match of clientEntryGlob.scan(clientPath.pathname)) {
    clientEntryPaths.push(new URL(match, clientPath).pathname);
  }

  Bun.build({
    entrypoints: clientEntryPaths,
    outdir: new URL("../../dist/client", import.meta.url).pathname,
    naming: {
      asset: "assets/[name].[ext]",
    }
  });
}

Bun.serve({
  port,
  routes: {
    "/": homeHandler,
    "/about": aboutHandler,
    "/about/:name": aboutHandler,
    "/static/:dir/:file": fileHandler
  }
});

console.log(`Server running on port ${port}`);