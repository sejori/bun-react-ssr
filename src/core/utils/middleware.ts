export interface MiddlewareContext<S extends object = any> {
  request: Bun.BunRequest;
  server: Bun.Server<any>;
  state: S;
}

export type Middleware<S extends object = any> = (
  ctx: MiddlewareContext<S>,
  next: () => Promise<Response | void>
) => Promise<Response | void> | Response | void;

export const cascade = <S extends object = any, M extends Middleware<S>[] = Middleware<S>[]>(...mware: M) =>
  async (request: Bun.BunRequest, server: Bun.Server<any>): Promise<Response> => {
    const ctx = {
      request,
      server,
      state: {} as S
    };

    const dispatch = async (i: number): Promise<Response> => {
      try {
        const fn = mware[i];
        if (!fn) return new Response("Not found", { status: 404 });

        let nextCalled = false;
        let nextResult: Response | undefined;
        const next = async () => {
          if (nextCalled) {
            throw new Error("next() called multiple times");
          }
          nextCalled = true;
          nextResult = await dispatch(i + 1);
          return nextResult;
        };

        const res = await fn(ctx, next);
        if (res instanceof Response) return res;
        if (nextCalled && nextResult) return nextResult;
        
        return dispatch(i + 1);
      } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", { status: 500 });
      }
    };

    return dispatch(0);
  };
