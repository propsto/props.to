import debug from "debug";

// Check if the code is running on the server
if (typeof process === "undefined" || typeof window !== "undefined") {
  throw new Error("Logger can only be used in a server-side environment.");
}

export default (function () {
  const parsed = import.meta.url.split("%3F");
  return debug(`@propsto:${parsed.length > 1 ? parsed[1] : "logger"}`);
})();
