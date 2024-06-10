import { resolve } from "path";
import { readFileSync } from "fs";
import debugLogger from "debug";

// Check if the code is running on the server
if (typeof process === "undefined" || typeof window !== "undefined") {
  throw new Error("Logger can only be used in a server-side environment.");
}

// Read and parse package.json at module load time
const pkgJsonPath = resolve(process.cwd(), "package.json");
const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));

// Create a logger object with different log levels
const logger = debugLogger(pkgJson.name);

export default logger;
