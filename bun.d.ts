import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// server prop access and dev-only HMR handles
declare global {
  interface Window {
    __SERVER_PROPS__: any;
    __ROOT__?: import("react-dom/client").Root;
    __HMR__: string;
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
