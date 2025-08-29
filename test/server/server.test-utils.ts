import { MiddlewareContext } from "../../src/server/utils/middleware";

export const fakeServer = {} as unknown as Bun.Server;
export const fakeContext = (req?: Request, state: object = {}): MiddlewareContext => {
  const request = req || new Request("http://test/hello");
  return { request, state, server: fakeServer };
}