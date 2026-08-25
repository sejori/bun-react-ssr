import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// server prop access
declare global {
  interface Window {
    __SERVER_PROPS__: any;
  }
}

declare module "*.css";
declare module "*.svg";
declare module "*.png";

// testing DOM matchers
declare module 'bun:test' {
  interface Matchers<T>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  interface AsymmetricMatchers extends TestingLibraryMatchers<AsymmetricMatchers, Matchers> {}
}
