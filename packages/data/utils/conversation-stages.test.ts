import { describe, expect, it } from "vitest";
import {
  CONVERSATION_STAGES,
  STAGES,
  nextStages,
  stageDefinition,
  stageLabel,
  stageOrder,
} from "./conversation-stages";

describe("conversation stages", () => {
  it("orders the stages along the escalation path", () => {
    expect(STAGES).toEqual(["DIRECT", "REPEATED", "FINAL"]);
    expect(STAGES.map(stageOrder)).toEqual([0, 1, 2]);
  });

  it("labels every stage", () => {
    for (const { stage } of CONVERSATION_STAGES) {
      expect(stageLabel(stage)).not.toBe("");
    }
    expect(stageLabel("REPEATED")).toBe("Repeated without change");
  });

  it("gates only the last stage to admins and mails admins from the second on", () => {
    expect(STAGES.filter(s => stageDefinition(s).requiresAdmin)).toEqual([
      "FINAL",
    ]);
    expect(STAGES.filter(s => stageDefinition(s).notifiesAdmins)).toEqual([
      "REPEATED",
      "FINAL",
    ]);
  });
});

describe("nextStages", () => {
  it("offers every stage before any step", () => {
    expect(nextStages([])).toEqual(["DIRECT", "REPEATED", "FINAL"]);
  });

  it("offers the highest stage reached and every later one", () => {
    expect(nextStages(["DIRECT"])).toEqual(["DIRECT", "REPEATED", "FINAL"]);
    expect(nextStages(["DIRECT", "REPEATED"])).toEqual(["REPEATED", "FINAL"]);
    expect(nextStages(["FINAL"])).toEqual(["FINAL"]);
  });

  it("uses the highest stage, not the latest one", () => {
    expect(nextStages(["REPEATED", "DIRECT"])).toEqual(["REPEATED", "FINAL"]);
  });
});
