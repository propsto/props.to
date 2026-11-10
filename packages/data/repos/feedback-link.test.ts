import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateFeedbackLink,
  deactivateFeedbackLink,
  deleteFeedbackLink,
  getFeedbackLinkBySlug,
  getUserFeedbackLinks,
} from "./feedback-link";

// The owner is checked in the where clause, so a fake that matches on both
// id and userId stands in for the database. Another user's link exists too,
// so a missing owner filter would change it.
const LINK = { id: "link_alice", userId: "user_alice" };
const OTHER_LINK = { id: "link_bob", userId: "user_bob" };
const MANAGED = { id: "link_tpl", userId: "user_alice", isManaged: true };
const LINKS: { id: string; userId: string; isManaged?: boolean }[] = [
  LINK,
  OTHER_LINK,
  MANAGED,
];

const db = vi.hoisted(() => ({
  feedbackLink: {
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
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

function count({
  where,
}: {
  where: { id: string; userId?: string; isManaged?: boolean };
}) {
  return Promise.resolve({
    count: LINKS.filter(
      l =>
        l.id === where.id &&
        (where.userId === undefined || l.userId === where.userId) &&
        !(where.isManaged === false && l.isManaged),
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
        isManaged: false,
      });
    },
  );
});

describe("managed link templates are not member links", () => {
  it("getFeedbackLinkBySlug never resolves a template", async () => {
    db.feedbackLink.findFirst.mockResolvedValue(null);

    const result = await getFeedbackLinkBySlug("tpl", "user_alice", "org_acme");

    expect(db.feedbackLink.findFirst).toHaveBeenCalledTimes(1);
    expect(db.feedbackLink.findFirst.mock.calls[0][0].where).toEqual({
      slug: "tpl",
      userId: "user_alice",
      organizationId: "org_acme",
      isManaged: false,
    });
    expect(result).toEqual(
      expect.objectContaining({ success: true, data: null }),
    );
  });

  it("getUserFeedbackLinks never lists templates", async () => {
    db.feedbackLink.findMany.mockResolvedValue([]);
    db.feedbackLink.count.mockResolvedValue(0);

    await getUserFeedbackLinks("user_alice", { organizationId: "org_acme" });

    const expected = expect.objectContaining({
      userId: "user_alice",
      isManaged: false,
    });
    expect(db.feedbackLink.findMany.mock.calls[0][0].where).toEqual(expected);
    expect(db.feedbackLink.count.mock.calls[0][0].where).toEqual(expected);
  });

  it.each(mutations)("%s does not match a template", async (_name, mutate) => {
    const result = await mutate(MANAGED.id, MANAGED.userId);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "Link not found" }),
    );
  });
});
