import { describe, it, expect, vi, afterEach } from "vitest";
import type { Debugger } from "debug";

interface LoggerModule {
  createLogger: (scope?: string) => Debugger;
  logger: Debugger;
  resolveLoggerScope: (url?: string) => string;
}

const isLoggerModule = (value: unknown): value is LoggerModule => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.resolveLoggerScope === "function" &&
    typeof record.createLogger === "function" &&
    typeof record.logger === "function"
  );
};

const loadLoggerModule = async (): Promise<LoggerModule> => {
  const moduleValue = await import("../index.mjs");

  if (!isLoggerModule(moduleValue)) {
    throw new Error("Unexpected logger module shape.");
  }

  return moduleValue;
};

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
      } = await loadLoggerModule();

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
      const { createLogger } = await loadLoggerModule();
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

describe("redact", () => {
  it("masks secret-bearing keys and bearer-looking strings, keeps the rest", async () => {
    const { redact } = (await import("../index.mjs")) as unknown as {
      redact: <T>(value: T) => T;
    };
    const jwt =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.c2lnbmF0dXJlLXNpZ25hdHVyZS1zaWduYXR1cmU";
    const input = {
      email: "leo@example.com",
      access_token: "ya29.a0AbCdEf-ghi",
      clientSecret: "GOCSPX-abc123",
      nested: {
        session_token: "s3cret",
        password: "hunter2",
        note: `bearer ${jwt}`,
      },
      list: [{ id_token: jwt }, "plain"],
      empty: "",
      when: new Date(0),
    };
    const out = redact(input);
    expect(out.email).toBe("leo@example.com");
    expect(out.access_token).toBe("[redacted]");
    expect(out.clientSecret).toBe("[redacted]");
    expect(out.nested.session_token).toBe("[redacted]");
    expect(out.nested.password).toBe("[redacted]");
    expect(out.nested.note).toBe("bearer [redacted]");
    expect(out.list[0]).toEqual({ id_token: "[redacted]" });
    expect(out.list[1]).toBe("plain");
    expect(out.empty).toBe("");
    expect(out.when).toBeInstanceOf(Date);
    // Never mutates the input
    expect(input.access_token).toBe("ya29.a0AbCdEf-ghi");
  });

  it("applies to the server logger output", async () => {
    const { createLogger } = await loadLoggerModule();
    const { logs, restore } = collectLogs();
    try {
      const log = createLogger("redaction-test");
      log.enabled = true;
      log("linkAccount %O", {
        access_token: "ya29.secret-value",
        userId: "u1",
      });
    } finally {
      restore();
    }
    const joined = logs.join("\n");
    expect(joined).toContain("u1");
    expect(joined).not.toContain("secret-value");
  });
});
