declare module "@propsto/logger" {
  import type { Debugger } from "debug";

  export const logger: Debugger;
  export function createLogger(scope?: string): Debugger;
  export function resolveLoggerScope(url?: string): string;
  export function redact<T>(value: T, depth?: number): T;
}

declare module "@propsto/logger?*" {
  export * from "@propsto/logger";
}
