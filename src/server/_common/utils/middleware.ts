export interface MiddlewareContext<
  S extends object = any,
  R extends object = any,
> {
  state: S;
  request: Request & R;
  server: Bun.Server;
}

export type Middleware<
S extends object = any,
R extends object = any
> = (
  ctx: MiddlewareContext<S, R>,
  next: () => Promise<Response | void>
) => Promise<Response | void> | Response | void;

export const cascade = <
S extends object = any,
R extends object = any,  
M extends Middleware<S, R>[] = Middleware<S, R>[]
>(...mware: M) =>
  async (request: Request, server: Bun.Server): Promise<Response> => {
    const ctx = {
      request: request as Request & R,
      server,
      state: {} as S
    };

    const dispatch = async (i: number): Promise<Response> => {
      const fn = mware[i];
      if (!fn) return new Response("Not found", { status: 404 });

      const res = await fn(ctx, () => dispatch(i + 1));
      if (res instanceof Response) return res;
      return dispatch(i + 1);
    };

    try {
      return await dispatch(0);
    } catch (err) {
      return new Response("Internal Server Error", { status: 500 });
    }
  };