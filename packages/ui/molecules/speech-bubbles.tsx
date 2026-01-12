import type { CSSProperties, JSX } from "react";
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

type BubbleStyle = CSSProperties & Record<string, string | number | undefined>;

export function SpeechBubbles(): JSX.Element {
  const columns = Math.max(3, Math.ceil(Math.sqrt(BUBBLE_COUNT)));
  const rows = Math.ceil(BUBBLE_COUNT / columns);
  const bubbles = Array.from({ length: BUBBLE_COUNT }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const jitterX = (Math.random() - 0.5) * 18;
    const jitterY = (Math.random() - 0.5) * 20;
    const baseX = ((column + 0.5) / columns) * 100;
    const baseY = ((row + 0.5) / rows) * 100;
    const x = clamp(baseX + jitterX, 6, 94);
    const y = clamp(baseY + jitterY, 8, 92);
    const useRight = x > 55;
    const useBottom = y > 55;

    const sizePreset = SIZE_PRESETS[index % SIZE_PRESETS.length];
    const animationClass = ANIMATIONS[index % ANIMATIONS.length];
    const colorIndex = index % COLOR_COUNT;
    const tailEdgeOffset = Math.round(sizePreset.width * 0.24);
    const bubbleColor = `var(--bubble-color-${String(colorIndex)}-hex)`;

    const bubbleStyle: BubbleStyle = {
      width: `${String(sizePreset.width)}px`,
      height: `${String(sizePreset.height)}px`,
      left: useRight ? undefined : `${String(x)}%`,
      right: useRight ? `${String(100 - x)}%` : undefined,
      top: useBottom ? undefined : `${String(y)}%`,
      bottom: useBottom ? `${String(100 - y)}%` : undefined,
      "--tail-size": `${String(sizePreset.tailSize)}px`,
      "--tail-bottom": `${String(sizePreset.tailOffset)}px`,
      "--tail-left": useRight ? undefined : `${String(tailEdgeOffset)}px`,
      "--tail-right": useRight ? `${String(tailEdgeOffset)}px` : undefined,
      "--tail-color": bubbleColor,
      backgroundColor: bubbleColor,
    };

    return {
      key: index,
      className: `speech-bubble ${sizePreset.kind}-bubble ${animationClass}`,
      style: bubbleStyle,
    };
  });

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
