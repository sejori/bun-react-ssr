export type Middleware<S extends {} = {}> = (
  request: Request, 
  state: S,
  next: () => Promise<Response | void>,
  server: Bun.Server
) => Promise<Response | void> | Response | void;

export const cascade = (...mware: Middleware[]) =>
  async (request: Request, server: Bun.Server): Promise<Response> => {
    const state = {};

    const dispatch = async (i: number): Promise<Response> => {
      const fn = mware[i];
      if (!fn) return new Response("Not found", { status: 404 });

      const res = await fn(request, state, () => dispatch(i + 1), server);
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