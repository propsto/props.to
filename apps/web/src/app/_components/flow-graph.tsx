"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import { cn } from "@propsto/ui/lib/utils";

// Same data shape the sequence diagram used, so stories need no changes.
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

// viewBox units; the SVG scales to its container width.
const W = 760;
const H = 460;
const NODE_W = 128;
const NODE_H = 52;
// How far from a node's centre an edge starts/ends, and the collision radius.
const EDGE_GAP = 46;
const COLLIDE_R = 82;

interface GNode extends SimulationNodeDatum {
  id: number;
  actor: Actor;
}

function describeStep(step: Step, actors: Actor[]): string {
  const from = actors[step.from]?.name ?? "";
  const to = actors[step.to]?.name ?? "";
  const kind = step.kind ?? "message";
  if (kind === "note" || step.from === step.to) return `a note on ${from}`;
  if (kind === "talk") return `${from} and ${to} talk, outside props.to`;
  if (kind === "end") return `${from} to ${to}, access ends`;
  return `${from} to ${to}, in props.to`;
}

const KIND_COLOR: Record<StepKind, string> = {
  message: "#4f46e5", // indigo-600
  note: "#d97706", // amber-600
  talk: "#059669", // emerald-600
  end: "#e11d48", // rose-600
};

// A quadratic curve between two points, bowed to one side so antiparallel
// arrows (A→B and B→A) separate, with the ends pulled back off the nodes.
function edgePath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { d: string; mx: number; my: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Trim both ends so the line meets the node edge, not its centre.
  const sx = ax + ux * EDGE_GAP;
  const sy = ay + uy * EDGE_GAP;
  const ex = bx - ux * EDGE_GAP;
  const ey = by - uy * EDGE_GAP;
  // Control point bowed left of travel; the perpendicular flips with direction.
  const bow = Math.min(len * 0.22, 70);
  const cx = (sx + ex) / 2 + -uy * bow;
  const cy = (sy + ey) / 2 + ux * bow;
  // Quadratic midpoint, where the label rides.
  const mx = 0.25 * sx + 0.5 * cx + 0.25 * ex;
  const my = 0.25 * sy + 0.5 * cy + 0.25 * ey;
  return { d: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, mx, my };
}

// A small loop above a node, for a note the actor makes to themselves.
function loopPath(x: number, y: number): { d: string; mx: number; my: number } {
  const top = y - NODE_H / 2;
  return {
    d: `M ${x - 16} ${top} C ${x - 54} ${top - 70}, ${x + 54} ${top - 70}, ${x + 16} ${top}`,
    mx: x,
    my: top - 48,
  };
}

export function FlowGraph({
  actors,
  steps,
  label,
}: {
  actors: Actor[];
  steps: Step[];
  label: string;
}): React.ReactElement {
  const total = steps.length;
  const [visible, setVisible] = useState(0);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [, setFrame] = useState(0); // bump to re-render on simulation ticks
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<GNode[]>([]);
  const simRef = useRef<Simulation<GNode, undefined> | null>(null);
  const dragId = useRef<number | null>(null);

  // Undirected pairs that appear in any step: the graph's static "map".
  const pairs = useMemo(() => {
    const seen = new Set<string>();
    const out: [number, number][] = [];
    for (const s of steps) {
      if (s.from === s.to) continue;
      const key = s.from < s.to ? `${s.from}-${s.to}` : `${s.to}-${s.from}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push([s.from, s.to]);
    }
    return out;
  }, [steps]);

  // Seed node positions on a circle during the first render, so the graph shows
  // immediately (and server-renders) before the simulation settles it.
  if (nodesRef.current.length !== actors.length) {
    const n = actors.length;
    nodesRef.current = actors.map((actor, i) => ({
      id: i,
      actor,
      x: W / 2 + Math.cos((2 * Math.PI * i) / n - Math.PI / 2) * 150,
      y: H / 2 + Math.sin((2 * Math.PI * i) / n - Math.PI / 2) * 120,
    }));
  }

  // Build and run the force simulation once per story (parent re-keys on change).
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nodes = nodesRef.current;
    const links = pairs.map(([source, target]) => ({ source, target }));

    const clamp = (): void => {
      for (const node of nodes) {
        node.x = Math.max(
          NODE_W / 2 + 8,
          Math.min(W - NODE_W / 2 - 8, node.x ?? W / 2),
        );
        node.y = Math.max(
          NODE_H / 2 + 56,
          Math.min(H - NODE_H / 2 - 8, node.y ?? H / 2),
        );
      }
    };

    const sim = forceSimulation(nodes)
      .force(
        "link",
        forceLink<GNode, { source: number; target: number }>(links)
          .id(d => d.id)
          .distance(210)
          .strength(0.25),
      )
      .force("charge", forceManyBody().strength(-900))
      .force("center", forceCenter(W / 2, H / 2))
      .force("collide", forceCollide(COLLIDE_R))
      .force("x", forceX(W / 2).strength(0.06))
      .force("y", forceY(H / 2).strength(0.08));
    simRef.current = sim;

    if (reduced) {
      sim.stop();
      for (let i = 0; i < 300; i += 1) sim.tick();
      clamp();
      setFrame(f => f + 1);
    } else {
      sim.on("tick", () => {
        clamp();
        setFrame(f => f + 1);
      });
    }
    return () => {
      sim.on("tick", null);
      sim.stop();
    };
  }, [actors, pairs]);

  // Reveal the story when it scrolls into view (all at once with reduced motion).
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if (reduced) {
          setVisible(total);
          setActive(total - 1);
        } else {
          setVisible(1);
          setActive(0);
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
    if (active >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      const next = active + 1;
      setActive(next);
      setVisible(v => Math.max(v, next + 1));
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, active, total]);

  const go = (index: number): void => {
    const next = Math.min(Math.max(index, 0), total - 1);
    setPlaying(false);
    setActive(next);
    setVisible(v => Math.max(v, next + 1));
  };

  const atEnd = visible >= total && active >= total - 1;
  const togglePlay = (): void => {
    if (atEnd) {
      setVisible(1);
      setActive(0);
      setPlaying(true);
      return;
    }
    setPlaying(p => !p);
  };

  // Pointer → viewBox coordinates, so a node follows the cursor while dragging.
  const toSvg = (event: ReactPointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      ctm.inverse(),
    );
    return { x: point.x, y: point.y };
  };

  const onNodeDown =
    (id: number) =>
    (event: ReactPointerEvent): void => {
      const sim = simRef.current;
      const node = nodesRef.current[id];
      if (!sim || !node) return;
      dragId.current = id;
      event.currentTarget.setPointerCapture(event.pointerId);
      sim.alphaTarget(0.25).restart();
      const p = toSvg(event);
      if (p) {
        node.fx = p.x;
        node.fy = p.y;
      }
    };
  const onNodeMove =
    (id: number) =>
    (event: ReactPointerEvent): void => {
      if (dragId.current !== id) return;
      const node = nodesRef.current[id];
      const p = toSvg(event);
      if (!node || !p) return;
      node.fx = p.x;
      node.fy = p.y;
    };
  const onNodeUp =
    (id: number) =>
    (event: ReactPointerEvent): void => {
      if (dragId.current !== id) return;
      dragId.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      const sim = simRef.current;
      const node = nodesRef.current[id];
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      sim?.alphaTarget(0);
    };

  const nodes = nodesRef.current;
  const nodeAt = (id: number): GNode | undefined => nodes[id];
  const step = steps[active];
  const kind: StepKind = step?.kind ?? "message";
  const color = KIND_COLOR[kind];
  const src = step ? nodeAt(step.from) : undefined;
  const dst = step ? nodeAt(step.to) : undefined;

  const arrow =
    step && src && dst
      ? step.from === step.to || kind === "note"
        ? loopPath(src.x ?? W / 2, src.y ?? H / 2)
        : edgePath(src.x ?? 0, src.y ?? 0, dst.x ?? 0, dst.y ?? 0)
      : null;

  return (
    <div ref={rootRef}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none select-none overflow-visible"
            role="img"
            aria-label={`${label}. Step ${active + 1} of ${total}: ${step ? describeStep(step, actors) : ""}`}
          >
            <defs>
              {(Object.keys(KIND_COLOR) as StepKind[]).map(k => (
                <marker
                  key={k}
                  id={`fg-arrow-${k}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={KIND_COLOR[k]} />
                </marker>
              ))}
            </defs>

            {/* Static map: faint links between actors that interact at all */}
            <g stroke="#cbd5e1" strokeWidth={1.5} fill="none">
              {pairs.map(([a, b]) => {
                const na = nodeAt(a);
                const nb = nodeAt(b);
                if (!na || !nb) return null;
                const touched =
                  step &&
                  ((step.from === a && step.to === b) ||
                    (step.from === b && step.to === a));
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    strokeOpacity={touched ? 0 : 0.7}
                  />
                );
              })}
            </g>

            {/* The current action: a curved, labelled, animated arrow */}
            {arrow && step ? (
              <g key={active}>
                <path
                  d={arrow.d}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.75}
                  strokeLinecap="round"
                  pathLength={1}
                  markerEnd={`url(#fg-arrow-${kind})`}
                  markerStart={
                    kind === "talk" ? `url(#fg-arrow-${kind})` : undefined
                  }
                  className="fg-draw"
                />
                <foreignObject
                  x={arrow.mx - 95}
                  y={arrow.my - 22}
                  width={190}
                  height={44}
                  className="overflow-visible"
                >
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="fg-pill rounded-full border bg-white/95 px-2.5 py-1 text-center text-[11px] font-medium leading-tight shadow-sm sm:text-xs"
                      style={{ borderColor: color, color }}
                    >
                      <span className="mr-1 font-semibold tabular-nums opacity-70">
                        {active + 1}.
                      </span>
                      {step.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            ) : null}

            {/* Actors as draggable node cards */}
            {nodes.map(node => {
              const isSrc = step?.from === node.id;
              const isDst = step?.to === node.id && step.from !== node.id;
              return (
                <foreignObject
                  key={node.id}
                  x={(node.x ?? W / 2) - NODE_W / 2}
                  y={(node.y ?? H / 2) - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  className="overflow-visible"
                  onPointerDown={onNodeDown(node.id)}
                  onPointerMove={onNodeMove(node.id)}
                  onPointerUp={onNodeUp(node.id)}
                  style={{ cursor: "grab" }}
                >
                  <div
                    className={cn(
                      "flex h-full w-full cursor-grab flex-col items-center justify-center rounded-2xl border px-2 text-center shadow-sm transition-all duration-300 active:cursor-grabbing",
                      node.actor.accent
                        ? "border-amber-300 bg-amber-100"
                        : "border-gray-200 bg-white",
                      isDst && "fg-arrive",
                    )}
                    style={
                      isSrc || isDst
                        ? {
                            boxShadow: `0 0 0 3px ${color}55`,
                            borderColor: color,
                          }
                        : undefined
                    }
                  >
                    <span className="truncate text-xs font-semibold leading-tight text-gray-950 sm:text-sm">
                      {node.actor.name}
                    </span>
                    <span className="truncate text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                      {node.actor.role}
                    </span>
                  </div>
                </foreignObject>
              );
            })}
          </svg>

          {/* Keyboard- and screen-reader-accessible step tracker */}
          <ol
            className="mt-3 flex flex-wrap justify-center gap-1.5"
            aria-label={`${label}, step by step`}
          >
            {steps.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  inert={i >= visible ? true : undefined}
                  aria-current={i === active ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${describeStep(s, actors)}`}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-all focus-visible:outline-2 focus-visible:outline-primary",
                    i >= visible && "pointer-events-none opacity-0",
                    i === active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-500",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
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
            <p className="mt-2 font-semibold text-gray-950">{step?.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
              {step?.detail}
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
              ) : atEnd ? (
                <RotateCcwIcon className="size-4" />
              ) : (
                <PlayIcon className="size-4" />
              )}
              {playing ? "Pause" : atEnd ? "Replay" : "Play"}
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
              <span className="w-6 border-t-2 border-indigo-600" /> In props.to
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 border-t-2 border-emerald-600" /> A
              conversation, outside props.to
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 border-t-2 border-rose-600" /> Access ends
            </li>
            <li className="text-[11px] text-muted-foreground/80">
              Drag the cards to rearrange the graph.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
