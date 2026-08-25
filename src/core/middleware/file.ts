import { Middleware } from "../utils/middleware";

const mimeTypes: Record<string, string> = {
  js: "application/javascript",
  css: "text/css",
  svg: "image/svg+xml",
};

export const fileMiddleware: Middleware = async (ctx) => {
  const { dir, file } = ctx.request.params as { dir: string, file: string };
  const path = new URL(
    `../../../dist/client/${dir}/${file}`,
    import.meta.url
  ).pathname;

  const bunFile = Bun.file(path);
  if (!await bunFile.exists()) {
    return new Response("Not found", { status: 404 });
  }

  const extension = file.split(".").pop() ?? "";

  return new Response(bunFile.stream(), {
    headers: {
      'Content-Type': mimeTypes[extension] ?? "text/plain"
    }
  })
}
