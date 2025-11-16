import { describe, it, expect, vi, afterEach } from "vitest";

const collectLogs = (): {
  logs: string[];
  restore: () => void;
} => {
  const logs: string[] = [];
  const infoSpy = vi.spyOn(console, "info").mockImplementation((...args) => {
    logs.push(
      args
        .map(arg => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" "),
    );
  });
  const stderrSpy = vi
    .spyOn(process.stderr, "write")
    .mockImplementation(input => {
      const value = Buffer.isBuffer(input) ? input.toString() : String(input);
      logs.push(value);
      return true;
    });

  return {
    logs,
    restore: () => {
      infoSpy.mockRestore();
      stderrSpy.mockRestore();
    },
  };
};

const flushLogs = async (): Promise<void> => {
  await new Promise<void>(resolve => {
    setTimeout(resolve, 0);
  });
};

afterEach(async () => {
  delete process.env.DEBUG;
  const debugModule = await import("debug");
  debugModule.default.disable();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("@propsto/logger", () => {
  it("derives namespace from URL query helpers", async () => {
    const { logs, restore } = collectLogs();
    const debugModule = await import("debug");
    debugModule.default.enable("@propsto:auth-test");

    try {
      const {
        resolveLoggerScope,
        createLogger,
        logger: defaultLogger,
        // @ts-expect-error TS cannot infer dynamic imports
      } = await import("../index.mjs");

      expect(defaultLogger.namespace).toBe("@propsto:logger");

      expect(resolveLoggerScope("file:///tmp/index.mjs")).toBe("logger");

      const scope = resolveLoggerScope("file:///tmp/index.mjs?auth-test");
      expect(scope).toBe("auth-test");

      const decodedScope = resolveLoggerScope(
        "file:///tmp/index.mjs?auth%2Ftest",
      );
      expect(decodedScope).toBe("auth/test");

      const scopedLogger = createLogger(scope);
      scopedLogger.enabled = true;
      scopedLogger("Scoped message %O", { hello: "world" });

      await flushLogs();

      expect(logs.length).toBeGreaterThan(0);
      const scopedLog = logs.find(message =>
        message.includes("@propsto:auth-test"),
      );

      expect(scopedLog).toBeDefined();
      expect(scopedLog).toMatch(/world/);
    } finally {
      restore();
    }
  });

  it("supports createLogger with extendable namespaces", async () => {
    const { logs, restore } = collectLogs();
    const debugModule = await import("debug");
    debugModule.default.enable("@propsto:custom*");
    process.env.DEBUG = "@propsto:*";

    try {
      // @ts-expect-error TS cannot infer dynamic imports
      const { createLogger } = await import("../index.mjs");
      const base = createLogger("custom");

      expect(base.namespace).toBe("@propsto:custom");
      expect(typeof base.extend).toBe("function");

      const child = base.extend("child");

      expect(child.namespace).toBe("@propsto:custom:child");

      child("Extended payload %O", { ok: true });

      await flushLogs();

      const childLog = logs.find(message =>
        message.includes("@propsto:custom:child"),
      );
      expect(childLog).toBeDefined();
      expect(childLog).toMatch(/ok/);
    } finally {
      restore();
    }
  });
});
