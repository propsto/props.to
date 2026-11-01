"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import { cn } from "@propsto/ui/lib/utils";

type StepKind = "message" | "note" | "talk" | "end";

interface Step {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind?: StepKind;
}

interface Scenario {
  id: string;
  label: string;
  title: string;
  intro: string;
  actors: { name: string; role: string; accent?: boolean }[];
  steps: Step[];
  takeaway: string;
}

const scenarios: Scenario[] = [
  {
    id: "career",
    label: "Your feedback, your career",
    title: "Feedback you keep, from one company to the next.",
    intro:
      "Most feedback tools belong to the employer: when you leave, your recognition stays behind. On props.to, every piece of feedback lands in a record that belongs to you.",
    actors: [
      { name: "You", role: "the person growing" },
      { name: "Company A", role: "your current job" },
      { name: "props.to", role: "your personal record", accent: true },
      { name: "Company B", role: "your next job" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "Join with your work Google account",
        detail:
          "Signing in with your company's Google Workspace puts you in its space, with its logo next to your name. Your link to receive feedback is ready on day one.",
      },
      {
        from: 1,
        to: 0,
        label: "Colleagues give you props",
        detail:
          "Teammates recognize your work, tagged with the company's values and read against your level's expectations.",
      },
      {
        from: 1,
        to: 2,
        label: "Each one is saved to your record",
        detail:
          "Feedback about you is stored in your personal account, not in a company drawer you lose access to.",
      },
      {
        from: 0,
        to: 0,
        kind: "note",
        label: "You move on from Company A",
        detail:
          "People change jobs. That shouldn't erase the evidence of how they grew.",
      },
      {
        from: 1,
        to: 0,
        kind: "end",
        label: "Your access to Company A ends",
        detail:
          "The company keeps its own records, like escalation steps and internal notes. The props you received go with you.",
      },
      {
        from: 0,
        to: 2,
        label: "Sign in with your personal email",
        detail:
          "You verified a personal email when you joined, so the same account opens without the work login.",
      },
      {
        from: 2,
        to: 0,
        label: "Everything you received is still there",
        detail:
          "Every piece of recognition, with its values and context, ready for your next interview or self-review.",
      },
      {
        from: 0,
        to: 3,
        label: "Join your next company",
        detail:
          "Sign in with the new company's Google Workspace. Same account, new space.",
      },
      {
        from: 3,
        to: 2,
        label: "New feedback adds to the same record",
        detail:
          "Your record grows with you: one place for everything you have received, from every company, team, client and community.",
      },
    ],
    takeaway: "Companies come and go. Your record of growth stays with you.",
  },
  {
    id: "props",
    label: "Recognize a colleague",
    title: "Props in the moment, conversations in your one on one.",
    intro:
      "Feedback works best close to the work. A colleague can give it in a minute, and it becomes something concrete to talk about in your next one on one.",
    actors: [
      { name: "Diego", role: "a colleague" },
      { name: "Sofía's link", role: "her feedback page" },
      { name: "Sofía", role: "receives the props" },
      { name: "Her lead", role: "one on ones" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        label: "Opens Sofía's feedback link",
        detail:
          "Every member gets a link when they join the company, so colleagues can give props from the first day.",
      },
      {
        from: 1,
        to: 0,
        label: "Shows what's expected at her level",
        detail:
          "If the company defines levels, the form shows Sofía's expectations, so feedback is fair to where she is.",
      },
      {
        from: 0,
        to: 1,
        label: "Writes props, tagged Kind and Approachable",
        detail:
          "If the company defines values, the giver can tag them. Each tag shows what that value looks like at Sofía's level.",
      },
      {
        from: 1,
        to: 2,
        label: "Sofía gets it right away",
        detail:
          "Feedback between members needs no admin approval by default. Feedback from outside the company waits for moderation.",
      },
      {
        from: 2,
        to: 3,
        kind: "talk",
        label: "Brings it to the next one on one",
        detail:
          "props.to supports the conversation, never replaces it. The props give the one on one something real to talk about.",
      },
    ],
    takeaway:
      "Feedback while it's fresh. The conversation still happens face to face.",
  },
  {
    id: "layers",
    label: "Set up your company",
    title: "Start with plain props. Add layers when they help.",
    intro:
      "Every company has its own way of growing people. Values, levels and an escalation path are optional layers you switch on when they fit.",
    actors: [
      { name: "People team", role: "company admins" },
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
          "Group people into teams and pick their leads. Leads can follow up on the people they lead.",
      },
      {
        from: 3,
        to: 1,
        label: "Teams join through the company domain",
        detail:
          "Colleagues sign in with their work Google account and join the company. No invitations needed.",
      },
      {
        from: 1,
        to: 3,
        label: "Everyone gets a link and the shared language",
        detail:
          "Each member can receive feedback right away, framed by the values and levels you chose.",
      },
    ],
    takeaway: "Use as much structure as you need, and nothing more.",
  },
  {
    id: "escalation",
    label: "When something needs to change",
    title: "A fair path when feedback alone isn't enough.",
    intro:
      "Sometimes the same problem keeps coming back. The process layer documents each step openly, so nothing comes as a surprise to the person involved.",
    actors: [
      { name: "Lead", role: "talks first" },
      { name: "Member", role: "the person involved" },
      { name: "props.to", role: "the shared record", accent: true },
      { name: "People team", role: "company admins" },
    ],
    steps: [
      {
        from: 0,
        to: 1,
        kind: "talk",
        label: "Talk first, face to face",
        detail:
          "Every step starts with a real conversation. props.to only records what was agreed.",
      },
      {
        from: 0,
        to: 2,
        label: "Step 1: direct feedback",
        detail:
          "The lead writes what the member hears, and can add an internal note for leads and People.",
      },
      {
        from: 2,
        to: 1,
        label: "Sees exactly what was shared",
        detail:
          "The member reads every shared note and gets an email for each step. Internal notes are never shown to them.",
      },
      {
        from: 0,
        to: 2,
        label: "Step 2: repeated, with a review date",
        detail:
          "If nothing changes, the lead records a second step with a date to review it and what happens next.",
      },
      {
        from: 2,
        to: 3,
        label: "People team is notified",
        detail:
          "Admins get an email as soon as a conversation reaches step 2, so People are involved early.",
      },
      {
        from: 3,
        to: 2,
        label: "Step 3: final conversation",
        detail:
          "Only People can record the final step. Leads can't skip ahead.",
      },
      {
        from: 2,
        to: 1,
        label: "Every step, in order, nothing hidden",
        detail:
          "The member sees the whole path: what was said, when, the review date and what happens next.",
      },
    ],
    takeaway: "Documented, fair, and never instead of the conversation.",
  },
];

const STEP_MS = 2600;

// Arrow geometry: lifeline centers sit at (i + 0.5) / n of the row width
function center(index: number, count: number): number {
  return ((index + 0.5) / count) * 100;
}

function StepRow({
  step,
  count,
  index,
  state,
  onSelect,
}: {
  step: Step;
  count: number;
  index: number;
  state: "hidden" | "shown" | "active";
  onSelect: () => void;
}): React.ReactElement {
  const kind = step.kind ?? "message";
  const left = Math.min(center(step.from, count), center(step.to, count));
  const width = Math.abs(center(step.to, count) - center(step.from, count));
  const pointsRight = step.to > step.from;
  const isNote = kind === "note" || step.from === step.to;
  // Labels center on their arrow, at least ~1.6 lanes wide, kept inside the diagram
  const labelWidth = Math.min(Math.max(width, 160 / count), 100);
  const labelLeft = Math.min(
    Math.max(left + width / 2 - labelWidth / 2, 0),
    100 - labelWidth,
  );

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={state === "active" ? "step" : undefined}
        className={cn(
          "group relative block h-16 w-full rounded-lg text-left transition-all duration-500 focus-visible:outline-2 focus-visible:outline-primary",
          state === "hidden" && "pointer-events-none opacity-0 translate-y-1",
          state === "shown" && "opacity-60 hover:opacity-100",
          state === "active" && "opacity-100 bg-white/70 shadow-sm",
        )}
      >
        <span className="sr-only">{`Step ${String(index + 1)}: `}</span>
        {isNote ? (
          <span
            className="absolute top-1/2 flex -translate-y-1/2 justify-center"
            style={{
              left: `${String(labelLeft)}%`,
              width: `${String(labelWidth)}%`,
            }}
          >
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-center text-[11px] leading-tight font-medium text-amber-900 sm:px-3 sm:py-1.5 sm:text-sm">
              {step.label}
            </span>
          </span>
        ) : (
          <>
            <span
              className="absolute top-2 px-1 text-center text-[11px] leading-tight font-medium text-gray-900 sm:text-sm"
              style={{
                left: `${String(labelLeft)}%`,
                width: `${String(labelWidth)}%`,
              }}
            >
              <span className="rounded bg-[#f2f2fd]/90 px-1 box-decoration-clone">
                <span className="mr-1 font-semibold text-muted-foreground tabular-nums">
                  {index + 1}.
                </span>
                {step.label}
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                "absolute bottom-4 h-0 border-t-2",
                kind === "talk" && "border-dashed border-emerald-500",
                kind === "end" && "border-dotted border-rose-400",
                kind === "message" && "border-gray-800",
              )}
              style={{ left: `${String(left)}%`, width: `${String(width)}%` }}
            >
              {/* Arrowhead, or heads on both ends for a conversation */}
              {(pointsRight || kind === "talk") && (
                <span
                  className={cn(
                    "absolute -top-[6px] -right-1 size-0 border-y-[5px] border-l-[8px] border-y-transparent",
                    kind === "talk"
                      ? "border-l-emerald-500"
                      : kind === "end"
                        ? "border-l-rose-400"
                        : "border-l-gray-800",
                  )}
                />
              )}
              {(!pointsRight || kind === "talk") && (
                <span
                  className={cn(
                    "absolute -top-[6px] -left-1 size-0 border-y-[5px] border-r-[8px] border-y-transparent",
                    kind === "talk"
                      ? "border-r-emerald-500"
                      : kind === "end"
                        ? "border-r-rose-400"
                        : "border-r-gray-800",
                  )}
                />
              )}
            </span>
          </>
        )}
      </button>
    </li>
  );
}

export default function HowItWorks(): React.ReactElement {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [visible, setVisible] = useState(0); // steps revealed so far
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const started = useRef(false);

  const scenario = scenarios.find(s => s.id === scenarioId) ?? scenarios[0];
  const total = scenario.steps.length;
  const count = scenario.actors.length;

  // Start playing the first time the section scrolls into view; with reduced
  // motion, show the whole sequence at once instead
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        if (reduced) {
          setVisible(total);
          setActive(total - 1);
        } else {
          setVisible(1);
          setPlaying(true);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [total]);

  useEffect(() => {
    if (!playing) return;
    if (visible >= total) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisible(v => v + 1);
      setActive(visible);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, visible, total]);

  const choose = (id: string) => {
    setScenarioId(id);
    setVisible(1);
    setActive(0);
    setPlaying(true);
  };

  const go = (index: number) => {
    const next = Math.min(Math.max(index, 0), total - 1);
    setPlaying(false);
    setActive(next);
    setVisible(v => Math.max(v, next + 1));
  };

  const togglePlay = () => {
    if (visible >= total) {
      setVisible(1);
      setActive(0);
      setPlaying(true);
      return;
    }
    setPlaying(p => !p);
  };

  const step = scenario.steps[active];

  return (
    <section ref={sectionRef} id="how-it-works" className="relative bg-white">
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            How it works
          </p>
          <h2 className="mx-auto mt-2 mb-4 max-w-3xl text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Your feedback belongs to you.
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
            props.to sits next to your one on ones, never in place of them. Pick
            a story below to see who does what, step by step.
          </p>

          {/* Scenario picker */}
          <div
            role="tablist"
            aria-label="Use cases"
            className="mb-8 flex flex-wrap justify-center gap-2"
          >
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === scenarioId}
                onClick={() => choose(s.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  s.id === scenarioId
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                  i === 0 &&
                    s.id !== scenarioId &&
                    "border-amber-300 bg-amber-50",
                )}
              >
                {s.label}
                {i === 0 ? (
                  <span
                    className={cn(
                      "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                      s.id === scenarioId
                        ? "bg-amber-300 text-gray-900"
                        : "bg-amber-200 text-amber-900",
                    )}
                  >
                    Why it matters
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            className="rounded-[2rem] border border-black/5 bubble-bg-3 p-4 shadow-md sm:p-8"
          >
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <h3 className="text-2xl font-semibold tracking-tight text-balance text-gray-950 sm:text-3xl">
                {scenario.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground">
                {scenario.intro}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              {/* Sequence diagram */}
              <div>
                <div className="relative">
                  {/* Lifelines */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-14 bottom-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${String(count)}, minmax(0, 1fr))`,
                    }}
                  >
                    {scenario.actors.map(actor => (
                      <div key={actor.name} className="flex justify-center">
                        <div
                          className={cn(
                            "h-full border-l-2 border-dashed",
                            actor.accent
                              ? "border-amber-400"
                              : "border-gray-300",
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Actors */}
                  <div
                    className="relative grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${String(count)}, minmax(0, 1fr))`,
                    }}
                  >
                    {scenario.actors.map(actor => (
                      <div
                        key={actor.name}
                        className={cn(
                          "mx-auto flex h-14 w-full max-w-36 flex-col items-center justify-center rounded-xl border px-1 text-center sm:px-2",
                          actor.accent
                            ? "border-amber-300 bg-amber-100"
                            : "border-gray-200 bg-white",
                        )}
                      >
                        <span className="text-xs leading-tight font-semibold text-gray-950 sm:text-sm">
                          {actor.name}
                        </span>
                        <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
                          {actor.role}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ol
                    key={scenario.id}
                    className="relative mt-3 space-y-1"
                    aria-label={`${scenario.label}, step by step`}
                  >
                    {scenario.steps.map((s, i) => (
                      <StepRow
                        key={s.label}
                        step={s}
                        count={count}
                        index={i}
                        state={
                          i >= visible
                            ? "hidden"
                            : i === active
                              ? "active"
                              : "shown"
                        }
                        onSelect={() => go(i)}
                      />
                    ))}
                  </ol>
                </div>
              </div>

              {/* Step detail and controls */}
              <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                <div
                  aria-live="polite"
                  className="min-h-40 rounded-2xl border border-black/5 bg-white p-5"
                >
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase tabular-nums">
                    Step {active + 1} of {total}
                  </p>
                  <p className="mt-2 font-semibold text-gray-950">
                    {step.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(active - 1)}
                    disabled={active === 0}
                    aria-label="Previous step"
                    className="rounded-full border border-gray-200 bg-white p-2 text-gray-700 hover:border-gray-400 disabled:opacity-40"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    {playing ? (
                      <PauseIcon className="size-4" />
                    ) : visible >= total ? (
                      <RotateCcwIcon className="size-4" />
                    ) : (
                      <PlayIcon className="size-4" />
                    )}
                    {playing ? "Pause" : visible >= total ? "Replay" : "Play"}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(active + 1)}
                    disabled={active >= total - 1}
                    aria-label="Next step"
                    className="rounded-full border border-gray-200 bg-white p-2 text-gray-700 hover:border-gray-400 disabled:opacity-40"
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-6 border-t-2 border-gray-800" /> In
                    props.to
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 border-t-2 border-dashed border-emerald-500" />{" "}
                    A conversation, outside props.to
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 border-t-2 border-dotted border-rose-400" />{" "}
                    Access ends
                  </li>
                </ul>
              </aside>
            </div>

            <p className="mt-8 text-center text-xl font-semibold text-balance text-gray-950 italic md:text-2xl">
              {scenario.takeaway}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
