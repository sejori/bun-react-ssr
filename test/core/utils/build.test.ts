import { describe, it, expect, beforeAll } from "bun:test";
import { Glob } from "bun";
import { buildClient, manifest } from "@core/utils/build";
import { vendorImports } from "@core/utils/vendor";

const outdir = new URL("../../../dist/client", import.meta.url).pathname;

// a string only present when react itself is part of the bundle
const REACT_INLINED = "react.transitional.element";

// the specifier must look like a package or a url, or react's own source text
// ("... from " + name) matches too
const specifiers = (bundle: string) =>
  [...bundle.matchAll(/(?:from|import)\s*"([^"]+)"/g)]
    .map(([, specifier]) => specifier!)
    .filter((specifier) => /^[@a-z/][a-z0-9@/._-]*$/i.test(specifier));

// bare, i.e. needing an importmap the browser may not have parsed in time
const bare = (bundle: string) =>
  specifiers(bundle).filter((specifier) => !specifier.startsWith("/"));

const imported = (bundle: string, url: string) =>
  [...bundle.matchAll(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*"${url}"`, "g"))]
    .flatMap(([, names]) => names!.split(",").map((part) => part.split(" as ")[0]!.trim()));

const bundles = async function* () {
  for await (const match of new Glob("**/*.client.js").scan(outdir)) {
    yield [match, await Bun.file(`${outdir}/${match}`).text()] as const;
  }
};

// the dev shape: react split out so hmr can swap a page chunk
beforeAll(async () => { await buildClient({ hmr: true }); });

describe("client build", () => {
  it("should hash every output under its /static url", () => {
    expect(manifest["/static/home/home.client.js"]).toBeTruthy();
    expect(manifest["/static/home/home.client.css"]).toBeTruthy();
    expect(manifest["/static/vendor/react.js"]).toBeTruthy();
  });

  it("should leave react external under hmr so one instance is shared", async () => {
    const bundle = await Bun.file(`${outdir}/home/home.client.js`).text();

    expect(specifiers(bundle)).toContain(vendorImports["react"]);
    // an inlined copy would give a re-imported chunk its own dispatcher
    expect(bundle).not.toContain(REACT_INLINED);
  });

  // a bare specifier would need an importmap, and react hoists its
  // modulepreload above anything the document can render
  it("should bake vendor urls in rather than leave bare specifiers", async () => {
    const urls = Object.values(vendorImports);

    for await (const [match, bundle] of bundles()) {
      expect({ match, bare: bare(bundle) }).toEqual({ match, bare: [] });

      for (const url of specifiers(bundle)) {
        expect({ match, url }).toEqual({ match, url: urls.includes(url) ? url : "unmapped" });
      }
    }
  });

  // `export *` over react's CommonJS silently yields a shim with no static
  // exports, which only fails once the browser links the module
  it("should re-export every name the bundles import from a shim", async () => {
    const exported = async (path: string) => {
      const shim = await Bun.file(`${outdir}${path.replace("/static", "")}`).text();
      return (shim.match(/export\s*\{([^}]*)\}/)?.[1] ?? "")
        .split(",")
        .map((part) => part.split(" as ").pop()!.trim());
    };

    for await (const [match, bundle] of bundles()) {
      for (const url of Object.values(vendorImports)) {
        const names = imported(bundle, url);
        if (!names.length) continue;

        const available = await exported(url);
        expect({ match, url, missing: names.filter((n) => !available.includes(n)) })
          .toEqual({ match, url, missing: [] });
      }
    }
  });

  it("should serve each vendor shim from the importmap path", async () => {
    for (const path of Object.values(vendorImports)) {
      expect(await Bun.file(`${outdir}${path.replace("/static", "")}`).exists()).toBe(true);
    }
  });

  // last, so the restore cannot race the assertions above
  it("should inline react without hmr, so prod needs no importmap", async () => {
    await buildClient();
    const bundle = await Bun.file(`${outdir}/home/home.client.js`).text();

    expect(specifiers(bundle)).toEqual([]);
    expect(bundle).toContain(REACT_INLINED);
    expect(await Bun.file(`${outdir}/vendor/react.js`).exists()).toBe(false);

    await buildClient({ hmr: true }); // restore the shape the other tests assert
  });
});
