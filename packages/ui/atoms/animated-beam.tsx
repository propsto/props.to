"use client";

import {
  type JSX,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { cn } from "../lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#FFAA40",
  gradientStopColor = "#9C40FF",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps): JSX.Element {
  const rawId = useId();
  const gradientId = useMemo(() => `beam-${rawId.replace(/:/g, "")}`, [rawId]);
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [isVertical, setIsVertical] = useState(false);
  const [isRightToLeft, setIsRightToLeft] = useState(false);
  const [isBottomToTop, setIsBottomToTop] = useState(false);

  const x1 = useMemo(() => {
    const direction = reverse ? !isRightToLeft : isRightToLeft;
    return direction ? "90%; -10%;" : "10%; 110%;";
  }, [isRightToLeft, reverse]);

  const x2 = useMemo(() => {
    const direction = reverse ? !isRightToLeft : isRightToLeft;
    return direction ? "100%; 0%;" : "0%; 100%;";
  }, [isRightToLeft, reverse]);

  const y1 = useMemo(() => {
    const direction = reverse ? !isBottomToTop : isBottomToTop;
    return direction ? "90%; -10%;" : "10%; 110%;";
  }, [isBottomToTop, reverse]);

  const y2 = useMemo(() => {
    const direction = reverse ? !isBottomToTop : isBottomToTop;
    return direction ? "100%; 0%;" : "0%; 100%;";
  }, [isBottomToTop, reverse]);

  useEffect(() => {
    const updatePath = (): void => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const vertical = Math.abs(endY - startY) > Math.abs(endX - startX);
        setIsVertical(vertical);
        setIsRightToLeft(endX < startX);
        setIsBottomToTop(endY < startY);

        const controlY = startY - curvature;
        const d = `M ${String(startX)},${String(startY)} Q ${String(
          (startX + endX) / 2,
        )},${String(controlY)} ${String(endX)},${String(endY)}`;
        setPathD(d);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updatePath();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
      viewBox={`0 0 ${String(svgDimensions.width)} ${String(
        svgDimensions.height,
      )}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${gradientId})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="0%"
          y1="0%"
          y2="0%"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          {!isVertical ? (
            <>
              <animate
                attributeName="x1"
                values={x1}
                dur={`${String(duration)}s`}
                begin={`${String(delay)}s`}
                keyTimes="0; 1"
                keySplines="0.16 1 0.3 1"
                calcMode="spline"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values={x2}
                dur={`${String(duration)}s`}
                begin={`${String(delay)}s`}
                keyTimes="0; 1"
                keySplines="0.16 1 0.3 1"
                calcMode="spline"
                repeatCount="indefinite"
              />
            </>
          ) : (
            <>
              <animate
                attributeName="y1"
                values={y1}
                dur={`${String(duration)}s`}
                begin={`${String(delay)}s`}
                keyTimes="0; 1"
                keySplines="0.16 1 0.3 1"
                calcMode="spline"
                repeatCount="indefinite"
              />
              <animate
                attributeName="y2"
                values={y2}
                dur={`${String(duration)}s`}
                begin={`${String(delay)}s`}
                keyTimes="0; 1"
                keySplines="0.16 1 0.3 1"
                calcMode="spline"
                repeatCount="indefinite"
              />
            </>
          )}
        </linearGradient>
      </defs>
    </svg>
  );
}
