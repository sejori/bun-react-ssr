import { Glob } from "bun";
import { rm } from "node:fs/promises";
import { external } from "./vendor.ts";

const pagesUrl = new URL("../../", import.meta.url);
const pagesPath = pagesUrl.pathname;
const outdir = new URL("../../../dist/client", import.meta.url).pathname;
const vendorPath = new URL("../vendor/", import.meta.url).pathname;

// content hashes of every built file, keyed by its `/static/...` URL. The HMR
// runtime diffs this against what the browser already loaded.
export const manifest: Record<string, string> = {};

// `hmr` splits react out into the shared vendor build so a page chunk can be
// re-imported without re-instantiating it. Prod leaves it off and inlines react
// per page, which costs a little duplication but keeps the output to plain
// self-contained bundles with no importmap.
export const buildClient = async ({ minify = false, hmr = false } = {}) => {
  // cleared so switching between the two shapes cannot leave a stale vendor
  // build behind, and so the manifest always mirrors what is on disk
  await rm(outdir, { recursive: true, force: true });
  for (const key in manifest) delete manifest[key];

  const entrypoints: string[] = [];
  for await (const match of new Glob("**/*.client.ts").scan(pagesPath)) {
    entrypoints.push(new URL(match, pagesUrl).pathname);
  }

  const vendorEntrypoints: string[] = [];
  if (hmr) {
    for await (const match of new Glob("*.ts").scan(vendorPath)) {
      vendorEntrypoints.push(new URL(match, `file://${vendorPath}`).pathname);
    }
  }

  // One build per entrypoint. Bun emits shared CSS (Layout.css) only once per
  // build, attached to the first entrypoint, so a single multi-entry build
  // leaves every other page without its stylesheet.
  const results = await Promise.all([
    // the shims share react's internals through a split chunk, so every
    // specifier resolves to a single copy
    ...(hmr ? [Bun.build({
      entrypoints: vendorEntrypoints,
      root: vendorPath,
      outdir: `${outdir}/vendor`,
      target: "browser",
      splitting: true,
      minify,
    })] : []),
    ...entrypoints.map((entrypoint) =>
      Bun.build({
        entrypoints: [entrypoint],
        root: pagesPath,
        outdir,
        target: "browser",
        minify,
        external: hmr ? external : undefined,
        naming: {
          asset: "assets/[name].[ext]",
        },
      })
    ),
  ]);

  const failed = results.filter((result) => !result.success);
  if (failed.length) {
    for (const { logs } of failed) logs.forEach((log) => console.error(log));
    throw new Error("Client build failed");
  }

  const outputs = results.flatMap((result) => result.outputs);
  await Promise.all(
    outputs.map(async (out) => {
      manifest[`/static${out.path.slice(outdir.length)}`] =
        Bun.hash(await out.arrayBuffer()).toString(36);
    })
  );

  return outputs.map((out) => out.path);
};

if (import.meta.main) {
  const paths = await buildClient({ minify: true });
  console.log(`Built ${paths.length} client files:`);
  paths.forEach((path) => console.log(`  ${path}`));
}
