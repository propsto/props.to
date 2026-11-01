"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquareHeartIcon } from "lucide-react";
import { cn } from "@propsto/ui/lib/utils";
import { SequenceDiagram, type Actor, type Step } from "./sequence-diagram";

// Who the visitor is, who reports to them, and who reports to those people.
// Plural labels read as "your <label>" in the diagram.
interface Role {
  id: string;
  label: string;
  short: string;
  reports: string[];
  admin?: boolean; // usually a company admin in props.to (People, C-level)
}

const roles: Role[] = [
  {
    id: "ic",
    label: "Developer or designer",
    short: "Individual contributor",
    reports: [],
  },
  {
    id: "lead",
    label: "Team lead",
    short: "Team lead",
    reports: ["developers", "designers", "other tech leads"],
  },
  {
    id: "manager",
    label: "Manager or director",
    short: "Manager",
    reports: ["team leads", "managers", "developers"],
  },
  {
    id: "clevel",
    label: "C-level",
    short: "C-level",
    reports: ["directors", "managers", "team leads"],
    admin: true,
  },
  {
    id: "people",
    label: "People / HR",
    short: "People / HR",
    reports: ["HR partners", "recruiters"],
    admin: true,
  },
];

// Who the people reporting to you lead in turn
const skipLevels: Record<string, string[]> = {
  "other tech leads": ["developers", "designers"],
  "team leads": ["developers", "designers"],
  managers: ["team leads", "developers"],
  directors: ["managers", "team leads", "developers"],
};

type Target =
  | { kind: "self" }
  | { kind: "direct" }
  | { kind: "peers" }
  | { kind: "skip"; group: string };

function targetLabel(target: Target, reports: string | null): string {
  switch (target.kind) {
    case "self":
      return "Me";
    case "peers":
      return "My teammates";
    case "direct":
      return `My ${reports ?? "team"}`;
    case "skip":
      return `Their ${target.group}`;
  }
}

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

interface Story {
  title: string;
  actors: Actor[];
  steps: Step[];
  takeaway: string;
}

// Every claim here must match the product: values and levels are optional
// company layers, members' props skip moderation, leads record escalation
// steps 1-2, company admins are told at step 2 and own step 3.
function buildStory(role: Role, reports: string | null, target: Target): Story {
  const record: Actor = {
    name: "props.to",
    role: "personal records",
    accent: true,
  };

  if (target.kind === "self") {
    const audience = reports ? `Your ${reports}` : "Your teammates";
    const manager = role.id === "clevel" ? "Your CEO" : "Your manager";
    return {
      title:
        role.id === "clevel"
          ? "Leaders need feedback the most, and get it the least."
          : "Hear how you're doing while it still matters.",
      actors: [
        { name: "You", role: role.short },
        { name: audience, role: reports ? "report to you" : "work with you" },
        record,
        { name: manager, role: "your one on ones" },
      ],
      steps: [
        {
          from: 0,
          to: 1,
          label: "Share your feedback link at the right moment",
          detail:
            "After a launch, a reorg or a hard decision: the link says feedback is welcome now, not at the next review.",
        },
        {
          from: 1,
          to: 2,
          label: reports
            ? `${audience} answer, anonymously if they prefer`
            : "Teammates answer in a minute",
          detail: reports
            ? "Upward feedback is easier when it can be anonymous. Your company decides whether anonymous feedback is allowed."
            : "A short form, tied to the moment, with your company's values to tag if it uses them.",
        },
        {
          from: 2,
          to: 0,
          label: "It lands in your personal record",
          detail: "Not in a company drawer. Feedback about you belongs to you.",
        },
        {
          from: 0,
          to: 3,
          kind: "talk",
          label: "Bring it to your one on one",
          detail:
            "props.to gives the conversation real material. It never replaces it.",
        },
        {
          from: 0,
          to: 0,
          kind: "note",
          label: "Years later, at another company",
          detail: "People move on. Their record of growth shouldn't vanish.",
        },
        {
          from: 2,
          to: 0,
          label: "Every piece is still yours",
          detail:
            "Sign in with your personal email and it's all there: what you received, from every company you worked at.",
        },
      ],
      takeaway: "Feedback about you, kept by you, wherever you work next.",
    };
  }

  if (target.kind === "peers" || target.kind === "direct") {
    const them =
      target.kind === "peers" ? "A teammate" : `Your ${reports ?? "team"}`;
    const leads = target.kind === "direct" && role.id !== "people";
    const steps: Step[] = [
      {
        from: 0,
        to: 2,
        label: "Open their feedback link",
        detail:
          "Everyone gets a link when they join the company, so feedback can start on day one.",
      },
      {
        from: 2,
        to: 0,
        label: "See what's expected at their level",
        detail:
          "If your company defines levels, the form shows their expectations, so your feedback is fair to where they are.",
      },
      {
        from: 0,
        to: 2,
        label: "Give props, tagged with a company value",
        detail:
          "If your company defines values, tag the ones you saw. Each shows what it looks like at their level.",
      },
      {
        from: 2,
        to: 1,
        label: "They get it right away, and keep it",
        detail:
          "Feedback between members needs no admin approval by default, and it stays in their personal record for good.",
      },
      {
        from: 0,
        to: 1,
        kind: "talk",
        label: "Talk it through in your one on one",
        detail:
          "The props start the conversation. The conversation still happens face to face.",
      },
    ];
    if (leads) {
      steps.push(
        {
          from: 0,
          to: 0,
          kind: "note",
          label: "If something keeps going wrong…",
          detail:
            "Most things get solved in the conversation. When they don't, there's a fair, documented path.",
        },
        {
          from: 0,
          to: 2,
          label: "Record escalation steps 1 and 2",
          detail:
            "As their lead, you write what they hear, add internal notes for People if needed, and set a review date at step 2.",
        },
        {
          from: 2,
          to: 3,
          label: "People are told at step 2",
          detail:
            "Company admins get an email when a conversation reaches step 2. Only they can record the final step.",
        },
        {
          from: 2,
          to: 1,
          label: "They see every shared step, never internal notes",
          detail:
            "Nothing is a surprise: they read what was said, when, and what happens next.",
        },
      );
    }
    return {
      title:
        target.kind === "peers"
          ? "Recognize the people you work with, while it's fresh."
          : `Grow your ${reports ?? "team"} with feedback that's fair to their level.`,
      actors: [
        { name: "You", role: role.short },
        { name: them, role: "receives feedback" },
        { name: "props.to", role: "values and levels", accent: true },
        ...(leads
          ? [{ name: "People team", role: "company admins" }]
          : [{ name: "Their record", role: "theirs for good" }]),
      ],
      steps: leads
        ? steps
        : steps.map(s => (s.to === 1 && s.from === 2 ? { ...s, to: 3 } : s)),
      takeaway: leads
        ? "Recognition in the moment, a fair path when needed, and the conversation always first."
        : "Props while they're fresh. The conversation still happens face to face.",
    };
  }

  // Skip level: the people your reports lead
  const leaders = `Your ${reports ?? "leads"}`;
  const group = cap(target.group);
  return {
    title: `Make sure ${target.group} get the feedback they need.`,
    actors: [
      { name: "You", role: role.short },
      { name: leaders, role: "lead them" },
      { name: `Their ${target.group}`, role: "receive feedback" },
      { name: "props.to", role: "shared language", accent: true },
    ],
    steps: [
      {
        from: 0,
        to: 3,
        label: role.admin
          ? "Set the company's values and levels"
          : "Use the company's values and levels",
        detail:
          "Optional layers: what your company cares about, and what's expected at each career step. Everyone gives feedback in the same language.",
      },
      {
        from: 1,
        to: 2,
        label: `${cap(reports ?? "Leads")} give their ${target.group} props`,
        detail:
          "Tagged with values and read against each person's level. It reaches them right away.",
      },
      {
        from: 0,
        to: 2,
        label: `You recognize ${target.group} directly, too`,
        detail: `${group} rarely hear from you. Their link makes it a one-minute thing.`,
      },
      {
        from: 1,
        to: 2,
        kind: "talk",
        label: "Leads keep the one on ones",
        detail:
          "props.to supports those conversations with real material. It doesn't replace them.",
      },
      ...(role.admin
        ? [
            {
              from: 1,
              to: 3,
              label: "When something needs to change, leads record it",
              detail:
                "Steps 1 and 2 of the escalation path, with shared notes, internal notes and a review date.",
            },
            {
              from: 3,
              to: 0,
              label: "You're told at step 2, and own step 3",
              detail:
                "As a company admin you get an email at step 2, so People are involved early. Only admins record the final step.",
            },
          ]
        : [
            {
              from: 1,
              to: 3,
              label: "When something needs to change, leads record it",
              detail:
                "A documented, visible path. People are told at step 2 and own the final step.",
            },
          ]),
      {
        from: 3,
        to: 2,
        label: "Their props stay theirs when they move on",
        detail:
          "If they leave, everything they received goes with them. That's a reason to stay, not a risk.",
      },
    ],
    takeaway:
      "Structure where it helps, conversations where they matter, and records people keep.",
  };
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
      )}
    >
      {children}
    </button>
  );
}

function Question({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <fieldset className="animate-in fade-in duration-300">
      <legend className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-950 sm:text-base">
        <span className="flex size-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white tabular-nums">
          {n}
        </span>
        {title}
      </legend>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </fieldset>
  );
}

export default function RoleExplorer({
  feedbackUrl,
}: {
  feedbackUrl?: string;
}): React.ReactElement {
  const [roleId, setRoleId] = useState<string | null>(null);
  const [reports, setReports] = useState<string | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const role = roles.find(r => r.id === roleId) ?? null;
  const needsReports = Boolean(role && role.reports.length > 0);
  const targets: Target[] = !role
    ? []
    : !needsReports
      ? [{ kind: "self" }, { kind: "peers" }]
      : reports
        ? [
            { kind: "self" },
            { kind: "direct" },
            ...(skipLevels[reports] ?? []).map(group => ({
              kind: "skip" as const,
              group,
            })),
          ]
        : [];
  const story =
    role && target && (!needsReports || reports)
      ? buildStory(role, reports, target)
      : null;
  const storyKey = `${roleId ?? ""}|${reports ?? ""}|${target ? targetLabel(target, reports) : ""}`;
  // Bring a freshly built diagram into view; it starts playing once visible
  useEffect(() => {
    if (!target) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    storyRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [target, storyKey]);

  const context =
    role && target
      ? [
          role.label,
          reports ? `leads ${reports}` : null,
          `feedback about: ${targetLabel(target, reports).toLowerCase()}`,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";

  return (
    <section id="your-story" className="relative bg-gray-50">
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            Your story
          </p>
          <h2 className="mx-auto mt-2 mb-4 max-w-3xl text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            What can props.to do for you?
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
            Tell us where you sit and who you want feedback for. We&apos;ll draw
            how it works, step by step.
          </p>

          <div className="mx-auto mb-10 flex max-w-4xl flex-col gap-8">
            <Question n={1} title="I'm a…">
              {roles.map(r => (
                <Choice
                  key={r.id}
                  selected={roleId === r.id}
                  onClick={() => {
                    setRoleId(r.id);
                    setReports(null);
                    setTarget(null);
                  }}
                >
                  {r.label}
                </Choice>
              ))}
            </Question>

            {role && needsReports ? (
              <Question n={2} title="Who reports to you?">
                {role.reports.map(r => (
                  <Choice
                    key={r}
                    selected={reports === r}
                    onClick={() => {
                      setReports(r);
                      setTarget(null);
                    }}
                  >
                    {cap(r)}
                  </Choice>
                ))}
              </Question>
            ) : null}

            {targets.length > 0 ? (
              <Question
                n={needsReports ? 3 : 2}
                title="Who should the feedback be about?"
              >
                {targets.map(t => {
                  const text = targetLabel(t, reports);
                  return (
                    <Choice
                      key={text}
                      selected={
                        target !== null && targetLabel(target, reports) === text
                      }
                      onClick={() => setTarget(t)}
                    >
                      {text}
                    </Choice>
                  );
                })}
              </Question>
            ) : null}
          </div>

          {story ? (
            <div
              ref={storyRef}
              className="scroll-mt-24 rounded-[2rem] border border-black/5 bubble-bg-5 p-4 shadow-md sm:p-8"
            >
              <h3 className="mx-auto mb-8 max-w-3xl text-center text-2xl font-semibold tracking-tight text-balance text-gray-950 sm:text-3xl">
                {story.title}
              </h3>
              <SequenceDiagram
                key={storyKey}
                actors={story.actors}
                steps={story.steps}
                label={story.title}
              />
              <p className="mt-8 text-center text-xl font-semibold text-balance text-gray-950 italic md:text-2xl">
                {story.takeaway}
              </p>
              {feedbackUrl ? (
                <div className="mt-8 flex flex-col items-center gap-2 text-center">
                  <a
                    href={`${feedbackUrl}?context=${encodeURIComponent(context)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white"
                  >
                    <MessageSquareHeartIcon className="size-4" />
                    Give feedback on this diagram
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Opens props.to itself: we collect feedback on this page the
                    same way you would.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-muted-foreground">
              Pick your answers above and your diagram appears here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
