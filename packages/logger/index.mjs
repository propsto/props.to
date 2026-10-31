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

// Keys whose values never belong in logs, wherever they sit in a logged object
const SENSITIVE_KEY =
  /token|secret|password|authorization|cookie|verifier|nonce|api_?key|session/i;
// Bearer-looking strings inside free text: JWTs, Google access tokens, Google client secrets
const SENSITIVE_VALUE =
  /eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}|ya29\.[\w.-]+|GOCSPX-[\w-]+/g;
const REDACTED = "[redacted]";
const MAX_DEPTH = 6;

// Masks secrets in anything about to be logged. Objects are copied, never mutated.
export const redact = (value, depth = 0) => {
  if (typeof value === "string")
    return value.replace(SENSITIVE_VALUE, REDACTED);
  if (!value || typeof value !== "object" || depth > MAX_DEPTH) return value;
  if (value instanceof Date) return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redact(value.message),
      stack: value.stack,
    };
  }
  if (Array.isArray(value)) return value.map(item => redact(item, depth + 1));
  const copy = {};
  for (const [key, item] of Object.entries(value)) {
    copy[key] =
      SENSITIVE_KEY.test(key) && item != null && item !== ""
        ? REDACTED
        : redact(item, depth + 1);
  }
  return copy;
};

// Wraps a debug instance so every call is redacted first. A Proxy keeps the
// instance's own properties (the `enabled` accessor, namespace, color) intact.
const withRedaction = instance =>
  new Proxy(instance, {
    apply: (target, _thisArg, args) => target(...args.map(arg => redact(arg))),
    get: (target, prop, receiver) =>
      prop === "extend"
        ? suffix => withRedaction(target.extend(suffix))
        : Reflect.get(target, prop, receiver),
  });

const createConsoleLogger = namespace => {
  const label = `@propsto:${namespace}`;
  const consoleLogger = (...args) =>
    console.info(label, ...args.map(arg => redact(arg)));
  consoleLogger.log = console.info.bind(console);
  consoleLogger.namespace = label;
  consoleLogger.enabled = true;
  consoleLogger.extend = suffix => {
    if (!suffix) return createConsoleLogger(namespace);
    const sanitizedSuffix = suffix.startsWith(":") ? suffix.slice(1) : suffix;
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
    return withRedaction(loggerInstance);
  }
  return createConsoleLogger(namespace);
};

export const logger = createLogger(resolveScope(import.meta.url));
export const resolveLoggerScope = resolveScope;
