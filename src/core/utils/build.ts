import { Glob } from "bun";

const pagesUrl = new URL("../../", import.meta.url);
const pagesPath = pagesUrl.pathname;
const outdir = new URL("../../../dist/client", import.meta.url).pathname;

export const buildClient = async ({ minify = false } = {}) => {
  const entrypoints: string[] = [];
  for await (const match of new Glob("**/*.client.ts").scan(pagesPath)) {
    entrypoints.push(new URL(match, pagesUrl).pathname);
  }

  // One build per entrypoint. Bun emits shared CSS (Layout.css) only once per
  // build, attached to the first entrypoint, so a single multi-entry build
  // leaves every other page without its stylesheet.
  const results = await Promise.all(
    entrypoints.map((entrypoint) =>
      Bun.build({
        entrypoints: [entrypoint],
        root: pagesPath,
        outdir,
        target: "browser",
        minify,
        naming: {
          asset: "assets/[name].[ext]",
        },
      })
    )
  );

  const failed = results.filter((result) => !result.success);
  if (failed.length) {
    for (const { logs } of failed) logs.forEach((log) => console.error(log));
    throw new Error("Client build failed");
  }

  return results.flatMap((result) => result.outputs.map((out) => out.path));
};

if (import.meta.main) {
  const paths = await buildClient({ minify: true });
  console.log(`Built ${paths.length} client files:`);
  paths.forEach((path) => console.log(`  ${path}`));
}
