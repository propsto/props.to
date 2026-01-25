import { useMemo, type CSSProperties, type JSX } from "react";
import "./speech-bubbles.css";

const BUBBLE_COUNT = 16;
const COLOR_COUNT = 6;
const ANIMATIONS = [
  "animate-float-slow",
  "animate-float-medium",
  "animate-float-fast",
];
const SIZE_PRESETS = [
  { kind: "small", width: 80, height: 64, tailSize: 6, tailOffset: -12 },
  { kind: "small", width: 88, height: 72, tailSize: 8, tailOffset: -16 },
  { kind: "big", width: 96, height: 80, tailSize: 8, tailOffset: -16 },
  { kind: "big", width: 112, height: 96, tailSize: 10, tailOffset: -20 },
  { kind: "big", width: 100, height: 80, tailSize: 8, tailOffset: -16 },
] as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// Seeded PRNG for deterministic bubble positions (server/client must match)
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

type BubbleStyle = CSSProperties & Record<string, string | number | undefined>;

interface SpeechBubblesProps {
  scale?: number;
}

// Pre-compute static bubble configurations with deterministic positions
const BUBBLE_CONFIGS = (() => {
  const random = createSeededRandom(42);
  const columns = Math.max(3, Math.ceil(Math.sqrt(BUBBLE_COUNT)));
  const rows = Math.ceil(BUBBLE_COUNT / columns);
  return Array.from({ length: BUBBLE_COUNT }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const jitterX = (random() - 0.5) * 18;
    const jitterY = (random() - 0.5) * 20;
    const baseX = ((column + 0.5) / columns) * 100;
    const baseY = ((row + 0.5) / rows) * 100;
    const x = clamp(baseX + jitterX, 6, 94);
    const y = clamp(baseY + jitterY, 8, 92);
    return {
      index,
      x,
      y,
      useRight: x > 55,
      useBottom: y > 55,
      sizePreset: SIZE_PRESETS[index % SIZE_PRESETS.length],
      animationClass: ANIMATIONS[index % ANIMATIONS.length],
      colorIndex: index % COLOR_COUNT,
    };
  });
})();

export function SpeechBubbles({ scale = 1 }: SpeechBubblesProps): JSX.Element {
  const bubbles = useMemo(
    () =>
      BUBBLE_CONFIGS.map(config => {
        const scaledWidth = Math.round(config.sizePreset.width * scale);
        const scaledHeight = Math.round(config.sizePreset.height * scale);
        const scaledTailSize = Math.round(config.sizePreset.tailSize * scale);
        const scaledTailOffset = Math.round(
          config.sizePreset.tailOffset * scale,
        );
        const tailEdgeOffset = Math.round(scaledWidth * 0.24);
        const bubbleColor = `var(--bubble-color-${String(config.colorIndex)}-hex)`;

        const bubbleStyle: BubbleStyle = {
          width: `${String(scaledWidth)}px`,
          height: `${String(scaledHeight)}px`,
          left: config.useRight ? undefined : `${String(config.x)}%`,
          right: config.useRight ? `${String(100 - config.x)}%` : undefined,
          top: config.useBottom ? undefined : `${String(config.y)}%`,
          bottom: config.useBottom ? `${String(100 - config.y)}%` : undefined,
          "--tail-size": `${String(scaledTailSize)}px`,
          "--tail-bottom": `${String(scaledTailOffset)}px`,
          "--tail-left": config.useRight
            ? undefined
            : `${String(tailEdgeOffset)}px`,
          "--tail-right": config.useRight
            ? `${String(tailEdgeOffset)}px`
            : undefined,
          "--tail-color": bubbleColor,
          backgroundColor: bubbleColor,
        };

        return {
          key: config.index,
          className: `speech-bubble ${config.sizePreset.kind}-bubble ${config.animationClass}`,
          style: bubbleStyle,
        };
      }),
    [scale],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map(bubble => (
        <div
          key={bubble.key}
          className={bubble.className}
          style={bubble.style}
        />
      ))}
    </div>
  );
}
