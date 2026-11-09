import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { handleError } from "./error-handling";

vi.mock("../db", () => ({ Prisma }));

const clientVersion = "test";

describe("handleError", () => {
  it("maps known request errors by code", () => {
    const e = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      code: "P2002",
      clientVersion,
    });
    expect(handleError(e)).toEqual({
      success: false,
      data: undefined,
      error: "A record with this value already exists",
    });
  });

  it("hides validation, unknown and initialization error messages", () => {
    const errors = [
      new Prisma.PrismaClientValidationError(
        "Invalid `db.user.findUnique()` invocation: Argument `where` ...",
        { clientVersion },
      ),
      new Prisma.PrismaClientUnknownRequestError("raw query text", {
        clientVersion,
      }),
      new Prisma.PrismaClientInitializationError(
        "Can't reach database server at db.internal:5432",
        clientVersion,
      ),
    ];
    for (const e of errors) {
      expect(handleError(e).error).toBe("Something went wrong");
    }
  });

  it("keeps a repo's own error message", () => {
    expect(handleError(new Error("Value not found")).error).toBe(
      "Value not found",
    );
  });

  it("returns the generic message for non-Error throws", () => {
    expect(handleError("boom").error).toBe("Something went wrong");
    expect(handleError(undefined).error).toBe("Something went wrong");
  });
});
