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

export type StepKind = "message" | "note" | "talk" | "end";

export interface Step {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind?: StepKind;
}

export interface Actor {
  name: string;
  role: string;
  accent?: boolean;
}

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
        // Unrevealed steps stay out of the tab order and accessibility tree
        inert={state === "hidden"}
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

// Plays its steps the first time it scrolls into view (all at once with
// reduced motion). Re-key it to restart with a new sequence.
export function SequenceDiagram({
  actors,
  steps,
  label,
}: {
  actors: Actor[];
  steps: Step[];
  label: string;
}): React.ReactElement {
  const [visible, setVisible] = useState(0); // steps revealed so far
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = steps.length;
  const count = actors.length;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (reduced) {
          setVisible(total);
          setActive(total - 1);
        } else {
          setVisible(1);
          setPlaying(true);
        }
      },
      { threshold: 0.2 },
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

  const step = steps[active];

  return (
    <div ref={rootRef}>
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
              {actors.map(actor => (
                <div key={actor.name} className="flex justify-center">
                  <div
                    className={cn(
                      "h-full border-l-2 border-dashed",
                      actor.accent ? "border-amber-400" : "border-gray-300",
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
              {actors.map(actor => (
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
              className="relative mt-3 space-y-1"
              aria-label={`${label}, step by step`}
            >
              {steps.map((s, i) => (
                <StepRow
                  key={s.label}
                  step={s}
                  count={count}
                  index={i}
                  state={
                    i >= visible ? "hidden" : i === active ? "active" : "shown"
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
            <p className="mt-2 font-semibold text-gray-950">{step.label}</p>
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
              <span className="w-6 border-t-2 border-gray-800" /> In props.to
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
    </div>
  );
}
