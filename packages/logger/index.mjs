/* eslint-disable no-console -- informative */
import debug from "debug";

// Check if the code is running on the server
if (typeof process === "undefined" || typeof window !== "undefined") {
  throw new Error("Logger can only be used in a server-side environment.");
}

export const logger = (function internalDebug() {
  const parsed = import.meta.url.split(/%3F|\?/);
  const logger = debug(`@propsto:${parsed.length > 1 ? parsed[1] : "logger"}`);

  logger.log = console.info.bind(console);
  return logger;
})();
