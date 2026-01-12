import type { Debugger } from "debug";

export const logger: Debugger;
export function createLogger(scope?: string): Debugger;
export function resolveLoggerScope(url?: string): string;
