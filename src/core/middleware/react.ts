import { createElement, FC } from "react";
import { renderToReadableStream } from "react-dom/server";
import { MiddlewareContext } from "../utils/middleware.ts";

export const reactMiddleware = <
  P extends {}, 
  C extends MiddlewareContext = MiddlewareContext
>(
  component: FC<P>, 
  propsArg: P | ((ctx: C) => P)
 ) =>
  async (ctx: C) => {
    const isDev = process.env.ENV === "dev";
    const props = typeof propsArg === "function"
      ? (propsArg as (ctx: C) => P)(ctx as C)
      : propsArg;

    // lowercased to match the built `<page>/<page>.client.js` paths on
    // case-sensitive filesystems (i.e. everywhere but macOS)
    const page = component.name.toLowerCase();

    const stream = await renderToReadableStream(
      createElement(component, props),
      {
        bootstrapModules: [
          `/static/${page}/${page}.client.js`,
          ...(isDev ? ["/static/core/hmr.client.js"] : []),
        ],
        bootstrapScriptContent: `
          window.__SERVER_PROPS__ = ${JSON.stringify(props)};
          ${isDev ? `window.__HMR__ = "/static/${page}/${page}.client";` : ""}
        `,
        onError(error) {
          console.error("React SSR error:", error);
        },
      }
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control":
          isDev
            ? "no-store"
            : "max-age=86400, stale-while-revalidate=86400",
      },
    });
  };
