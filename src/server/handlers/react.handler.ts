import { Attributes, createElement, FC } from "react";
import { renderToReadableStream } from "react-dom/server";
import { Middleware } from "../utils/middleware.ts";

export const reactHandler = <P extends {}>(
  component: FC<P>, 
  propsArg: P | ((req: Request, server: Bun.Server) => P)
): Middleware =>
  async (req, state) => {
    const props = typeof propsArg === "function"
      ? (propsArg as (req: Request, state: {}) => P)(req, state)
      : propsArg;

    const stream = await renderToReadableStream(
      createElement(component, props),
      {
        bootstrapModules: [`/${component.name}/${component.name}.client.js`],
        bootstrapScriptContent: `
          window.__INITIAL_PROPS__ = ${JSON.stringify(props)};
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
