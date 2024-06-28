import debugLib from "debug";

// Check if the code is running on the server
if (typeof process === "undefined" || typeof window !== "undefined") {
  throw new Error("Logger can only be used in a server-side environment.");
}

export const debug = (function internalDebug() {
  const parsed = import.meta.url.split("%3F");
  return debugLib(`@propsto:${parsed.length > 1 ? parsed[1] : "logger"}`);
})();
