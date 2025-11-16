/* eslint-disable no-console -- informative */
import debug from "debug";

const DEFAULT_SCOPE = "logger";
const isServerLike = typeof window === "undefined";
const hasProcess = typeof process !== "undefined";

const resolveScope = (url = "") => {
  const directIndex = url.indexOf("?");
  const encodedIndex = url.indexOf("%3F");
  const index = directIndex !== -1 ? directIndex : encodedIndex;
  if (index === -1) return DEFAULT_SCOPE;
  const offset = directIndex !== -1 ? 1 : 3;
  const query = url.slice(index + offset);
  return query ? decodeURIComponent(query) : DEFAULT_SCOPE;
};

const createConsoleLogger = namespace => {
  const label = `@propsto:${namespace}`;
  const consoleLogger = (...args) => console.info(label, ...args);
  consoleLogger.log = console.info.bind(console);
  consoleLogger.namespace = label;
  consoleLogger.enabled = true;
  consoleLogger.extend = suffix => {
    if (!suffix) return createConsoleLogger(namespace);
    const sanitizedSuffix = suffix.startsWith(":")
      ? suffix.slice(1)
      : suffix;
    return createConsoleLogger(`${namespace}:${sanitizedSuffix}`);
  };
  consoleLogger.destroy = () => {};
  return consoleLogger;
};

export const createLogger = (scope = DEFAULT_SCOPE) => {
  const namespace = scope || DEFAULT_SCOPE;
  if (hasProcess && isServerLike) {
    const loggerInstance = debug(`@propsto:${namespace}`);
    loggerInstance.log = console.info.bind(console);
    return loggerInstance;
  }
  return createConsoleLogger(namespace);
};

export const logger = createLogger(resolveScope(import.meta.url));
export const resolveLoggerScope = resolveScope;
