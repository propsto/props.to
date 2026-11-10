import { beforeEach, describe, expect, it, vi } from "vitest";
import { setPasswordByToken } from "./password-reset-token";

const db = vi.hoisted(() => ({
  passwordResetToken: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../db", () => ({
  db,
  Prisma: {
    validator: () => (value: unknown) => value,
    PrismaClientKnownRequestError: class extends Error {},
    PrismaClientValidationError: class extends Error {},
    PrismaClientUnknownRequestError: class extends Error {},
    PrismaClientInitializationError: class extends Error {},
    PrismaClientRustPanicError: class extends Error {},
  },
}));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));

const users = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("./user", () => users);

const row = (expires: Date) => ({
  id: "prt_1",
  email: "ana@example.com",
  token: "tok",
  expires,
});
const invalid = expect.objectContaining({
  success: false,
  error: "Invalid token details",
});

describe("setPasswordByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.passwordResetToken.findUnique.mockResolvedValue(
      row(new Date(Date.now() + 3_600_000)),
    );
    db.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
    const user = { id: "user_1", email: "ana@example.com" };
    users.getUserByEmail.mockResolvedValue({ success: true, data: user });
    users.updateUser.mockResolvedValue({ success: true, data: user });
  });

  it("changes the password for a valid token", async () => {
    const result = await setPasswordByToken("tok", "N3w-password");
    expect(result.success).toBe(true);
    expect(users.updateUser).toHaveBeenCalledTimes(1);
    expect(users.updateUser).toHaveBeenCalledWith("user_1", {
      password: "N3w-password",
    });
    expect(db.passwordResetToken.deleteMany).toHaveBeenCalledTimes(1);
    expect(db.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: "prt_1",
        expires: { gt: expect.any(Date) },
      }),
    });
  });

  it("consumes the token before the password changes", async () => {
    await setPasswordByToken("tok", "N3w-password");
    expect(
      db.passwordResetToken.deleteMany.mock.invocationCallOrder[0],
    ).toBeLessThan(users.updateUser.mock.invocationCallOrder[0] as number);
  });

  it("rejects an expired token", async () => {
    db.passwordResetToken.findUnique.mockResolvedValue(
      row(new Date(Date.now() - 1000)),
    );
    expect(await setPasswordByToken("tok", "N3w-password")).toEqual(invalid);
    expect(users.updateUser).not.toHaveBeenCalled();
  });

  it("rejects an unknown token", async () => {
    db.passwordResetToken.findUnique.mockResolvedValue(null);
    expect(await setPasswordByToken("tok", "N3w-password")).toEqual(invalid);
    expect(users.updateUser).not.toHaveBeenCalled();
  });

  it("rejects a token already used by a concurrent request", async () => {
    db.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
    expect(await setPasswordByToken("tok", "N3w-password")).toEqual(invalid);
    expect(users.updateUser).not.toHaveBeenCalled();
  });
});
