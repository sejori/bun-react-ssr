import { Glob } from "bun";
import { rm } from "node:fs/promises";
import { external, vendorImports } from "./vendor.ts";

const pagesUrl = new URL("../../", import.meta.url);
const pagesPath = pagesUrl.pathname;
const outdir = new URL("../../../dist/client", import.meta.url).pathname;
const vendorPath = new URL("../vendor/", import.meta.url).pathname;

// content hashes of every built file, keyed by its `/static/...` URL. The HMR
// runtime diffs this against what the browser already loaded.
export const manifest: Record<string, string> = {};

// Bun keeps the original specifier for an external import, so the vendor urls
// are substituted into the emitted js. Baking them in beats an importmap in the
// document: react hoists `<link rel="modulepreload">` above anything rendered,
// and a preload that resolves before the map is parsed fails the bare specifier.
const bakeVendorUrls = async (out: Bun.BuildArtifact) => {
  const source = await out.text();

  const baked = source.replace(
    /(\bfrom\s*|\bimport\s*)"(react[^"]*)"/g,
    (_, keyword, specifier) => {
      const url = vendorImports[specifier];
      if (!url) throw new Error(`no vendor shim for "${specifier}", add one in src/core/vendor`);

      return `${keyword}"${url}"`;
    }
  );

  if (baked !== source) await Bun.write(out.path, baked);

  return baked;
};


// the shims share react's internals through a split chunk, so every specifier
// resolves to a single copy
const buildVendor = async (minify: boolean) => {
  const entrypoints: string[] = [];
  for await (const match of new Glob("*.ts").scan(vendorPath)) {
    entrypoints.push(new URL(match, `file://${vendorPath}`).pathname);
  }

  return Bun.build({
    entrypoints,
    root: vendorPath,
    outdir: `${outdir}/vendor`,
    target: "browser",
    splitting: true,
    minify,
  });
};

// `hmr` splits react out into the shared vendor build so a page chunk can be
// re-imported without re-instantiating it. Prod leaves it off and inlines react
// per page, which costs a little duplication but keeps the output to plain
// self-contained bundles.
export const buildClient = async ({ minify = false, hmr = false } = {}) => {
  // cleared so switching between the two shapes cannot leave a stale vendor
  // build behind, and so the manifest always mirrors what is on disk
  await rm(outdir, { recursive: true, force: true });
  for (const key in manifest) delete manifest[key];

  const entrypoints: string[] = [];
  for await (const match of new Glob("**/*.client.ts").scan(pagesPath)) {
    entrypoints.push(new URL(match, pagesUrl).pathname);
  }

  // built first, and on its own: it writes inside the page outdir, so running
  // the two concurrently would race for the directory
  const vendor = hmr ? await buildVendor(minify) : undefined;

  // One build per entrypoint. Bun emits shared CSS (Layout.css) only once per
  // build, attached to the first entrypoint, so a single multi-entry build
  // leaves every other page without its stylesheet.
  const pages = await Promise.all(
    entrypoints.map((entrypoint) =>
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
    )
  );

  const results = vendor ? [vendor, ...pages] : pages;
  const failed = results.filter((result) => !result.success);
  if (failed.length) {
    for (const { logs } of failed) logs.forEach((log) => console.error(log));
    throw new Error("Client build failed");
  }

  // kept in memory rather than read back, so the hash covers the baked urls
  // without racing bun's own write of the same file
  const baked = new Map<string, string>();
  if (hmr) {
    await Promise.all(
      pages
        .flatMap((result) => result.outputs)
        .filter((out) => out.path.endsWith(".js"))
        .map(async (out) => baked.set(out.path, await bakeVendorUrls(out)))
    );
  }

  const outputs = results.flatMap((result) => result.outputs);
  await Promise.all(
    outputs.map(async (out) => {
      manifest[`/static${out.path.slice(outdir.length)}`] =
        Bun.hash(baked.get(out.path) ?? (await out.arrayBuffer())).toString(36);
    })
  );

  return outputs.map((out) => out.path);
};

if (import.meta.main) {
  const paths = await buildClient({ minify: true });
  console.log(`Built ${paths.length} client files:`);
  paths.forEach((path) => console.log(`  ${path}`));
}
