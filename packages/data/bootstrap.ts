import type { PrismaClient } from "@prisma/client";

/**
 * Idempotent bootstrap of the global template categories and default
 * templates. Safe to run on production after every migration: existing rows
 * are updated in place by their fixed id, and a template's fields are only
 * created when the template itself is created, so answers already stored
 * against those fields keep their references.
 *
 * The seed calls this too, so previews and prod share one definition.
 */

export const BOOTSTRAP_IDS = {
  recognitionCategory: "00000000-0000-0000-0000-000000000030",
  reviewCategory: "00000000-0000-0000-0000-000000000031",
  propsTemplate: "00000000-0000-0000-0000-000000000040",
  threeSixtyTemplate: "00000000-0000-0000-0000-000000000041",
  anonymousTemplate: "00000000-0000-0000-0000-000000000042",
  leadershipTemplate: "00000000-0000-0000-0000-000000000043",
  peerReviewTemplate: "00000000-0000-0000-0000-000000000044",
} as const;

const categories = [
  {
    id: BOOTSTRAP_IDS.recognitionCategory,
    name: "Recognition",
    description: "Templates for giving recognition and props",
    icon: "trophy",
  },
  {
    id: BOOTSTRAP_IDS.reviewCategory,
    name: "Performance Reviews",
    description: "Templates for structured feedback and reviews",
    icon: "clipboard",
  },
];

type FieldSeed = {
  label: string;
  type: "TEXTAREA" | "SELECT" | "RATING" | "SCALE" | "RADIO";
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  order: number;
};

const templates: {
  id: string;
  name: string;
  description: string;
  feedbackType:
    | "RECOGNITION"
    | "THREE_SIXTY"
    | "ANONYMOUS"
    | "MANAGER_FEEDBACK"
    | "PEER_REVIEW";
  categoryId: string;
  fields: FieldSeed[];
}[] = [
  {
    id: BOOTSTRAP_IDS.propsTemplate,
    name: "Quick Props",
    description: "A simple template for giving quick recognition and props.",
    feedbackType: "RECOGNITION",
    categoryId: BOOTSTRAP_IDS.recognitionCategory,
    fields: [
      {
        label: "What do you appreciate about this person?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Share what they did well...",
        helpText: "Be specific about their actions and impact",
        order: 0,
      },
      {
        label: "What values did they demonstrate?",
        type: "SELECT",
        required: false,
        options: [
          "Collaboration",
          "Innovation",
          "Leadership",
          "Integrity",
          "Excellence",
          "Customer Focus",
        ],
        helpText: "Select the value that best fits",
        order: 1,
      },
    ],
  },
  {
    id: BOOTSTRAP_IDS.threeSixtyTemplate,
    name: "360° Feedback",
    description:
      "Comprehensive feedback template for all-around performance insights.",
    feedbackType: "THREE_SIXTY",
    categoryId: BOOTSTRAP_IDS.reviewCategory,
    fields: [
      {
        label: "How would you rate their overall performance?",
        type: "RATING",
        required: true,
        helpText: "1 = Needs Improvement, 5 = Exceptional",
        order: 0,
      },
      {
        label: "What are their key strengths?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Describe their strongest areas...",
        order: 1,
      },
      {
        label: "What areas could they improve?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Provide constructive feedback...",
        order: 2,
      },
      {
        label: "How well do they communicate?",
        type: "SCALE",
        required: true,
        helpText: "1 = Poor, 10 = Excellent",
        order: 3,
      },
      {
        label: "How well do they collaborate with others?",
        type: "SCALE",
        required: true,
        helpText: "1 = Poor, 10 = Excellent",
        order: 4,
      },
      {
        label: "Any additional comments?",
        type: "TEXTAREA",
        required: false,
        placeholder: "Share any other thoughts...",
        order: 5,
      },
    ],
  },
  {
    id: BOOTSTRAP_IDS.anonymousTemplate,
    name: "Anonymous Feedback",
    description: "Share honest feedback anonymously.",
    feedbackType: "ANONYMOUS",
    categoryId: BOOTSTRAP_IDS.reviewCategory,
    fields: [
      {
        label: "What feedback would you like to share?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Your identity will remain anonymous...",
        order: 0,
      },
      {
        label: "Category",
        type: "SELECT",
        required: true,
        options: [
          "Work Quality",
          "Communication",
          "Leadership",
          "Teamwork",
          "Other",
        ],
        order: 1,
      },
      {
        label: "How important is this feedback?",
        type: "RADIO",
        required: true,
        options: ["Critical", "High", "Medium", "Low"],
        order: 2,
      },
    ],
  },
  {
    id: BOOTSTRAP_IDS.leadershipTemplate,
    name: "Leadership Feedback",
    description: "Provide feedback on leadership effectiveness.",
    feedbackType: "MANAGER_FEEDBACK",
    categoryId: BOOTSTRAP_IDS.reviewCategory,
    fields: [
      {
        label: "How would you rate their leadership?",
        type: "RATING",
        required: true,
        helpText: "1 = Needs Improvement, 5 = Exceptional",
        order: 0,
      },
      {
        label: "Do they provide clear direction?",
        type: "SCALE",
        required: true,
        helpText: "1 = Never, 10 = Always",
        order: 1,
      },
      {
        label: "Do they support your professional growth?",
        type: "SCALE",
        required: true,
        helpText: "1 = Never, 10 = Always",
        order: 2,
      },
      {
        label: "What do they do well as a leader?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Share specific examples...",
        order: 3,
      },
      {
        label: "How could they improve as a leader?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Provide constructive suggestions...",
        order: 4,
      },
    ],
  },
  {
    id: BOOTSTRAP_IDS.peerReviewTemplate,
    name: "Peer Review",
    description: "Template for peer-to-peer feedback.",
    feedbackType: "PEER_REVIEW",
    categoryId: BOOTSTRAP_IDS.reviewCategory,
    fields: [
      {
        label: "How was it working with this person?",
        type: "TEXTAREA",
        required: true,
        placeholder: "Describe your collaboration experience...",
        order: 0,
      },
      {
        label: "Would you want to work with them again?",
        type: "RADIO",
        required: true,
        options: ["Definitely", "Probably", "Maybe", "Probably Not"],
        order: 1,
      },
      {
        label: "Overall rating of collaboration",
        type: "RATING",
        required: true,
        helpText: "1 = Difficult, 5 = Excellent",
        order: 2,
      },
      {
        label: "Any specific feedback?",
        type: "TEXTAREA",
        required: false,
        placeholder: "Additional thoughts...",
        order: 3,
      },
    ],
  },
];

export async function bootstrapTemplates(prisma: PrismaClient) {
  for (const { id, ...data } of categories) {
    await prisma.templateCategory.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }
  for (const { id, fields, ...data } of templates) {
    const shared = { ...data, isPublic: true, isDefault: true };
    await prisma.feedbackTemplate.upsert({
      where: { id },
      create: { id, ...shared, fields: { create: fields } },
      update: shared,
    });
  }
  return BOOTSTRAP_IDS;
}
