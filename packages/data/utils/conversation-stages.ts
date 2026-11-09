import type { ConversationStage } from "@prisma/client";

export type ConversationStageDefinition = {
  stage: ConversationStage;
  label: string;
  // Only org admins may record a step at this stage
  requiresAdmin: boolean;
  // Org owners and admins are mailed when a step at this stage is recorded
  notifiesAdmins: boolean;
};

// The escalation path, in order. The only place that names the stages: every
// ordering, label and gate elsewhere reads from here.
export const CONVERSATION_STAGES: readonly ConversationStageDefinition[] = [
  {
    stage: "DIRECT",
    label: "Direct feedback",
    requiresAdmin: false,
    notifiesAdmins: false,
  },
  {
    stage: "REPEATED",
    label: "Repeated without change",
    requiresAdmin: false,
    notifiesAdmins: true,
  },
  {
    stage: "FINAL",
    label: "Final conversation",
    requiresAdmin: true,
    notifiesAdmins: true,
  },
];

export const STAGES: ConversationStage[] = CONVERSATION_STAGES.map(
  s => s.stage,
);

export const STAGE_LABELS = Object.fromEntries(
  CONVERSATION_STAGES.map(s => [s.stage, s.label]),
) as Record<ConversationStage, string>;

export function stageDefinition(
  stage: ConversationStage,
): ConversationStageDefinition {
  const definition = CONVERSATION_STAGES.find(s => s.stage === stage);
  if (!definition) throw new Error(`Unknown conversation stage: ${stage}`);
  return definition;
}

// Position on the escalation path, 0 for the first stage
export function stageOrder(stage: ConversationStage): number {
  return CONVERSATION_STAGES.indexOf(stageDefinition(stage));
}

export function stageLabel(stage: ConversationStage): string {
  return stageDefinition(stage).label;
}

// Stages a new step may take: the highest one reached and every later one.
// A conversation never goes back to an earlier stage.
export function nextStages(reached: ConversationStage[]): ConversationStage[] {
  const highest = Math.max(-1, ...reached.map(stageOrder));
  return STAGES.filter(stage => stageOrder(stage) >= highest);
}
