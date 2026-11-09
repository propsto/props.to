import { describe, expect, it } from "vitest";
import { groupValuesByOrg } from "./value-groups";

const acme = { id: "org-acme", name: "Acme Inc." };
const globex = { id: "org-globex", name: "Globex Corp." };

describe("groupValuesByOrg", () => {
  it("returns no groups for no values", () => {
    expect(groupValuesByOrg([])).toEqual([]);
  });

  it("keeps a single org's values in one group, in order", () => {
    expect(
      groupValuesByOrg([
        { id: "v1", name: "Ownership", organization: acme },
        { id: "v2", name: "Candor", organization: acme },
      ]),
    ).toEqual([
      {
        organization: acme,
        values: [
          { id: "v1", name: "Ownership" },
          { id: "v2", name: "Candor" },
        ],
      },
    ]);
  });

  it("keeps each org's values apart, even with the same name", () => {
    const groups = groupValuesByOrg([
      { id: "v1", name: "Candor", organization: acme },
      { id: "v2", name: "Craft", organization: acme },
      { id: "v3", name: "Candor", organization: globex },
    ]);

    expect(groups).toEqual([
      {
        organization: acme,
        values: [
          { id: "v1", name: "Candor" },
          { id: "v2", name: "Craft" },
        ],
      },
      { organization: globex, values: [{ id: "v3", name: "Candor" }] },
    ]);
  });

  it("groups by organization id, not by name", () => {
    const other = { id: "org-acme-2", name: "Acme Inc." };
    const groups = groupValuesByOrg([
      { id: "v1", name: "Candor", organization: acme },
      { id: "v2", name: "Candor", organization: other },
    ]);

    expect(groups).toHaveLength(2);
  });
});
