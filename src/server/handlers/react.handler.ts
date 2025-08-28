import { createElement, JSX } from "react";
import { renderToReadableStream } from "react-dom/server";
import { Middleware } from "../utils/middleware.ts";

export interface ReactServerState {
  message?: string;
  name?: string;
  logged: true;
}

export const reactHandler = (component: (props: ReactServerState) => JSX.Element): Middleware =>
  async (request, server) => {
    const stream = await renderToReadableStream(
      createElement(component, server["state"][request["id"]]),
      {
        bootstrapModules: [`/${component.name}/${component.name}.client.js`],
        bootstrapScriptContent: `
          window.__INITIAL_PROPS__ = ${JSON.stringify(server["state"][request["id"]])};
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
