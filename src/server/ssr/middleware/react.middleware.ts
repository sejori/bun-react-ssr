import { createElement, FC } from "react";
import { renderToReadableStream } from "react-dom/server";
import { MiddlewareContext } from "../../_common/utils/middleware.ts";

export const reactMiddleware = <
  P extends {}, 
  C extends MiddlewareContext = MiddlewareContext
>(
  component: FC<P>, 
  propsArg: P | ((ctx: C) => P)
 ) =>
  async (ctx: C) => {
    const props = typeof propsArg === "function"
      ? (propsArg as (ctx: C) => P)(ctx as C)
      : propsArg;

    const stream = await renderToReadableStream(
      createElement(component, props),
      {
        bootstrapModules: [`/static/${component.name}/${component.name}.client.js`],
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
