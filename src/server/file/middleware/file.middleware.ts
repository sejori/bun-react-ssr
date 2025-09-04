import { Middleware } from "../../_common/utils/middleware";

export const fileMiddleware: Middleware<
  object,
  {
    params: { dir: string, file: string }
  }
> = async (ctx) => {
  const dirName = ctx.request.params.dir;
  const fileName = ctx.request.params.file;
  const path = new URL(
    `../../../../dist/client/${dirName}/${fileName}`,
    import.meta.url
  ).pathname;

  const mimeType = ctx.request.url.endsWith(".js") 
    ? "application/javascript" 
    : ctx.request.url.endsWith(".css") 
    ? "text/css" 
    : ctx.request.url.endsWith(".svg")
    ? "image/svg+xml"
    : "text/plain"; 

  return new Response(Bun.file(path).stream(), {
    headers: {
      'Content-Type': mimeType
    }
  })
}