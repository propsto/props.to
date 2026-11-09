import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateFeedbackLink,
  deactivateFeedbackLink,
  deleteFeedbackLink,
} from "./feedback-link";

// The owner is checked in the where clause, so a fake that matches on both
// id and userId stands in for the database. Another user's link exists too,
// so a missing owner filter would change it.
const LINK = { id: "link_alice", userId: "user_alice" };
const OTHER_LINK = { id: "link_bob", userId: "user_bob" };
const LINKS = [LINK, OTHER_LINK];

const db = vi.hoisted(() => ({
  feedbackLink: {
    updateMany: vi.fn(),
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
vi.mock("@prisma/client", () => ({
  FeedbackType: {},
  FeedbackVisibility: {},
}));
vi.mock("../bootstrap", () => ({ BOOTSTRAP_IDS: {} }));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));

function count({ where }: { where: { id: string; userId?: string } }) {
  return Promise.resolve({
    count: LINKS.filter(
      l =>
        l.id === where.id &&
        (where.userId === undefined || l.userId === where.userId),
    ).length,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  db.feedbackLink.updateMany.mockImplementation(count);
  db.feedbackLink.deleteMany.mockImplementation(count);
});

const mutations: [
  string,
  (id: string, userId: string) => Promise<HandleEvent<{ id: string }>>,
][] = [
  ["deactivateFeedbackLink", deactivateFeedbackLink],
  ["activateFeedbackLink", activateFeedbackLink],
  ["deleteFeedbackLink", deleteFeedbackLink],
];

describe("feedback link mutations are scoped to the owner", () => {
  it.each(mutations)("%s changes the owner's link", async (_name, mutate) => {
    const result = await mutate(LINK.id, LINK.userId);

    expect(result).toEqual({ success: true, data: { id: LINK.id } });
  });

  it.each(mutations)(
    "%s returns not-found for another user's link id",
    async (_name, mutate) => {
      const result = await mutate(OTHER_LINK.id, LINK.userId);

      expect(result).toEqual(
        expect.objectContaining({ success: false, error: "Link not found" }),
      );
      const calls = [
        ...db.feedbackLink.updateMany.mock.calls,
        ...db.feedbackLink.deleteMany.mock.calls,
      ];
      expect(calls).toHaveLength(1);
      expect(calls[0][0].where).toEqual({
        id: OTHER_LINK.id,
        userId: LINK.userId,
      });
    },
  );
});
