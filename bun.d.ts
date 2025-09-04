import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { AsymmetricMatchers, Matchers } from "bun:test";

// server prop access
declare global {
  interface Window {
    __SERVER_PROPS__: any;
  }
}

// static file import types
declare module "*.css" {
  const content: string;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}

// testing DOM matchers
declare module 'bun:test' {
  interface Matchers<T>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  interface AsymmetricMatchers extends TestingLibraryMatchers<AsymmetricMatchers, Matchers> {}
}
