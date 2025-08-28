export type Middleware = (
  request: Request, 
  server: Bun.Server, 
  next: () => Promise<Response | void>
) => Promise<Response | void> | Response | void;

export const cascade = (...mware: Middleware[]) =>
  async (request: Request, server: Bun.Server): Promise<Response> => {
    const reqId = crypto.randomUUID();
    (request as any).id = reqId;
    if (!server["state"]) server["state"] = {};
    server["state"][reqId] = {};

    const dispatch = async (i: number): Promise<Response> => {
      const fn = mware[i];
      if (!fn) return new Response("Not found", { status: 404 });

      const res = await fn(request, server, () => dispatch(i + 1));
      if (res instanceof Response) {
        // short circuit
        return res;
      } else {
        // keep cascading
        return dispatch(i + 1);
      }
    };

    try {
      return await dispatch(0);
    } catch (err) {
      console.error("Middleware error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  };