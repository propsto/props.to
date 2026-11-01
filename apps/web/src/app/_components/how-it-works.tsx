"use client";

import { useState } from "react";
import { cn } from "@propsto/ui/lib/utils";
import { SequenceDiagram, type Actor, type Step } from "./sequence-diagram";

interface Scenario {
  id: string;
  label: string;
  title: string;
  intro: string;
  actors: Actor[];
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

export default function HowItWorks(): React.ReactElement {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const scenario = scenarios.find(s => s.id === scenarioId) ?? scenarios[0];

  const choose = (id: string) => setScenarioId(id);

  // Arrow keys, Home and End move between tabs (roving tabIndex)
  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = scenarios.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    choose(scenarios[next].id);
    document.getElementById(`how-it-works-tab-${scenarios[next].id}`)?.focus();
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
                id={`how-it-works-tab-${s.id}`}
                aria-selected={s.id === scenarioId}
                aria-controls="how-it-works-panel"
                tabIndex={s.id === scenarioId ? 0 : -1}
                onClick={() => choose(s.id)}
                onKeyDown={event => onTabKeyDown(event, i)}
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
            id="how-it-works-panel"
            aria-labelledby={`how-it-works-tab-${scenario.id}`}
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

            <SequenceDiagram
              key={scenario.id}
              actors={scenario.actors}
              steps={scenario.steps}
              label={scenario.label}
            />

            <p className="mt-8 text-center text-xl font-semibold text-balance text-gray-950 italic md:text-2xl">
              {scenario.takeaway}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
