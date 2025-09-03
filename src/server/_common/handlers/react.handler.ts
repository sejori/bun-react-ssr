import { createElement, FC } from "react";
import { renderToReadableStream } from "react-dom/server";
import { Middleware, MiddlewareContext } from "../utils/middleware.ts";

export const reactHandler = <P extends {}, S extends object = any>(
  component: FC<P>, 
  propsArg: P | ((ctx: MiddlewareContext<S>) => P)
): Middleware<S> =>
  async (ctx: MiddlewareContext<S>) => {
    const props = typeof propsArg === "function"
      ? (propsArg as (ctx: MiddlewareContext) => P)(ctx)
      : propsArg;

    const stream = await renderToReadableStream(
      createElement(component, props),
      {
        bootstrapModules: [`/${component.name}/${component.name}.client.js`],
        bootstrapScriptContent: `
          window.__SERVER_PROPS__ = ${JSON.stringify(props)};
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
          process.env.ENVIRONMENT === "PROD"
            ? "max-age=86400, stale-while-revalidate=86400"
            : "no-store",
      },
    });
  };
