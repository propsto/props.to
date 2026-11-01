"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, MessageSquareHeartIcon } from "lucide-react";
import { SequenceDiagram, type Actor, type Step } from "./sequence-diagram";

// Who the visitor is, who reports to them, and who reports to those people.
// Plural labels read as "your <label>" in the diagram.
interface Role {
  id: string;
  label: string;
  phrase: string; // completes "I'm …"
  short: string;
  reports: string[];
  admin?: boolean; // usually a company admin in props.to (People, C-level)
}

const roles: Role[] = [
  {
    id: "ic",
    label: "Developer or designer",
    phrase: "a developer or designer",
    short: "Individual contributor",
    reports: [],
  },
  {
    id: "lead",
    label: "Team lead",
    phrase: "a team lead",
    short: "Team lead",
    reports: ["developers", "designers", "other tech leads"],
  },
  {
    id: "manager",
    label: "Manager or director",
    phrase: "a manager or director",
    short: "Manager",
    reports: ["team leads", "managers", "developers"],
  },
  {
    id: "clevel",
    label: "C-level",
    phrase: "a C-level executive",
    short: "C-level",
    reports: ["directors", "managers", "team leads"],
    admin: true,
  },
  {
    id: "people",
    label: "People / HR",
    phrase: "in People / HR",
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
  | { kind: "skip"; group: string }
  | { kind: "company" };

function targetLabel(target: Target, reports: string | null): string {
  switch (target.kind) {
    case "self":
      return "me";
    case "peers":
      return "my teammates";
    case "direct":
      return `my ${reports ?? "team"}`;
    case "skip":
      return `their ${target.group}`;
    case "company":
      return "everyone at my company";
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

  if (target.kind === "company") {
    return {
      title: "Start with plain props. Add layers when they help.",
      actors: [
        { name: "You", role: role.short },
        { name: "props.to", role: "your company space", accent: true },
        { name: "Leads", role: "run one on ones" },
        { name: "Everyone", role: "your teams" },
      ],
      steps: [
        {
          from: 0,
          to: 1,
          label: "Create the company with Google Workspace",
          detail:
            "A Workspace admin signs in and claims the company's domain. The company logo shows across the app.",
        },
        {
          from: 0,
          to: 1,
          label: "Values layer: what you care about",
          detail:
            "Define your company values. People can tag feedback with them, and you can filter by value.",
        },
        {
          from: 0,
          to: 1,
          label: "Levels layer: what's expected",
          detail:
            "Describe each career level and what each value looks like at it. Givers see the expectations as they write.",
        },
        {
          from: 0,
          to: 2,
          label: "Process layer: who leads whom",
          detail:
            "Group people into teams and pick their leads. Leads can follow up on the people they lead, with a fair escalation path.",
        },
        {
          from: 3,
          to: 1,
          label: "Teams join through the company domain",
          detail:
            "Colleagues sign in with their work Google account and join. Each gets a link to receive feedback right away.",
        },
        {
          from: 2,
          to: 3,
          kind: "talk",
          label: "One on ones stay at the center",
          detail:
            "props.to gives leads real material for their conversations. It never replaces them.",
        },
        {
          from: 1,
          to: 3,
          label: "What people receive stays theirs",
          detail:
            "When someone moves on, their feedback goes with them. Your company keeps its own records, like escalation steps.",
        },
      ],
      takeaway: "Use as much structure as you need, and nothing more.",
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

// An inline <select> that reads as part of the sentence
function Blank({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; text: string }[];
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <span className="relative inline-flex align-baseline">
      <select
        aria-label={label}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="cursor-pointer appearance-none rounded-lg border-b-2 border-gray-900 bg-amber-100/70 py-0.5 pr-7 pl-2 font-semibold text-gray-950 hover:bg-amber-200/70 focus-visible:outline-2 focus-visible:outline-primary"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-1.5 size-4 -translate-y-1/2 text-gray-700"
      />
    </span>
  );
}

const targetId = (t: Target): string =>
  t.kind === "skip" ? `skip:${t.group}` : t.kind;

function targetsFor(role: Role, reports: string | null): Target[] {
  const base: Target[] =
    role.reports.length === 0
      ? [{ kind: "self" }, { kind: "peers" }]
      : [
          { kind: "self" },
          { kind: "direct" },
          ...(skipLevels[reports ?? ""] ?? []).map(group => ({
            kind: "skip" as const,
            group,
          })),
        ];
  return role.admin ? [...base, { kind: "company" }] : base;
}

export default function HowItWorks({
  feedbackUrl,
}: {
  feedbackUrl?: string;
}): React.ReactElement {
  // Defaults tell the story that matters most: feedback you keep
  const [roleId, setRoleId] = useState("ic");
  const [reports, setReports] = useState<string | null>(null);
  const [targetKey, setTargetKey] = useState("self");
  const storyRef = useRef<HTMLDivElement>(null);
  const changed = useRef(false);

  const role = roles.find(r => r.id === roleId) ?? roles[0];
  const targets = targetsFor(role, reports);
  const target = targets.find(t => targetId(t) === targetKey) ?? targets[0];
  const story = buildStory(role, reports, target);
  const sentence = `I'm ${role.phrase}${reports ? `, leading ${reports},` : ""} and I want feedback about ${targetLabel(target, reports)}`;

  // After a change, nudge the diagram into view if it's off screen
  useEffect(() => {
    if (!changed.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    storyRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  }, [sentence]);

  const update = (fn: () => void) => {
    changed.current = true;
    fn();
  };

  return (
    <section id="how-it-works" className="relative bg-white">
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            How it works
          </p>
          <h2 className="mx-auto mt-2 mb-4 max-w-3xl text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Your feedback belongs to you.
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
            props.to sits next to your one on ones, never in place of them. Tell
            us where you sit and we&apos;ll draw how it works for you.
          </p>

          <p className="mx-auto mb-10 max-w-4xl text-center text-xl leading-[2.4] text-balance text-gray-800 sm:text-2xl sm:leading-[2.2]">
            I&apos;m{" "}
            <Blank
              label="Your role"
              value={role.id}
              options={roles.map(r => ({ value: r.id, text: r.phrase }))}
              onChange={id =>
                update(() => {
                  const next = roles.find(r => r.id === id) ?? roles[0];
                  setRoleId(next.id);
                  setReports(next.reports[0] ?? null);
                  setTargetKey("self");
                })
              }
            />
            {reports ? (
              <>
                , leading{" "}
                <Blank
                  label="Who reports to you"
                  value={reports}
                  options={role.reports.map(r => ({ value: r, text: r }))}
                  onChange={value => update(() => setReports(value))}
                />
                ,
              </>
            ) : null}{" "}
            and I want feedback about{" "}
            <Blank
              label="Who the feedback is about"
              value={targetId(target)}
              options={targets.map(t => ({
                value: targetId(t),
                text: targetLabel(t, reports),
              }))}
              onChange={value => update(() => setTargetKey(value))}
            />
            .
          </p>

          <div
            ref={storyRef}
            className="scroll-mt-24 rounded-[2rem] border border-black/5 bubble-bg-3 p-4 shadow-md sm:p-8"
          >
            <h3 className="mx-auto mb-8 max-w-3xl text-center text-2xl font-semibold tracking-tight text-balance text-gray-950 sm:text-3xl">
              {story.title}
            </h3>
            <SequenceDiagram
              key={sentence}
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
                  href={`${feedbackUrl}?context=${encodeURIComponent(sentence)}`}
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
        </div>
      </div>
    </section>
  );
}
