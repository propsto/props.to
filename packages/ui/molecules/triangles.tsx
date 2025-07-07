"use client";

import "./triangles.css";
import { cva, type VariantProps } from "class-variance-authority";
import { useState, useEffect, type RefObject } from "react";
import React from "react";
import { useDeviceSize } from "../hooks/use-device-size";

export type TriangleVariantProps = VariantProps<typeof triangleVariants>;
const triangleVariants = cva("", {
  variants: {
    size: {
      small: 16,
      default: 80,
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function Triangles({
  parentRef,
  size = "default",
}: Readonly<
  {
    parentRef?: RefObject<HTMLElement | null>;
  } & TriangleVariantProps
>): React.ReactElement {
  const [maxTileX, setMaxTileX] = useState(0);
  const [maxTileY, setMaxTileY] = useState(0);
  const [deviceWidth, deviceHeight] = useDeviceSize();
  const colors = [
    "40 91% 97%",
    "0 0% 91%",
    "336 73% 96%",
    "244 75% 97%",
    "137 100% 28%, 0.04",
    "167 76% 95%",
  ];
  useEffect(() => {
    const [width, height] = parentRef?.current
      ? [parentRef.current.offsetWidth, parentRef.current.offsetHeight]
      : [deviceWidth, deviceHeight];
    const triangleSize = Number(triangleVariants({ size }));
    setMaxTileX(Math.ceil(width / triangleSize));
    setMaxTileY(Math.ceil(height / triangleSize));
  }, [deviceHeight, deviceWidth, parentRef, size]);
  return (
    <div
      className="absolute overflow-hidden top-0 left-0 flex flex-wrap"
      style={{
        ["--triangle-size" as string]: `${triangleVariants({ size })}px`,
      }}
    >
      {...Array.from({ length: maxTileX }, (x, i) =>
        Array.from({ length: maxTileY }, (y, j) => {
          const shapeType = ["one", "two", "three"][
            Math.floor(Math.random() * 3)
          ];
          return (
            <div
              className={`triangle ${shapeType} color-${Math.floor(Math.random() * colors.length).toString()}`}
              key={`${i.toString()}-${j.toString()}`}
            />
          );
        }),
      )}
    </div>
  );
}
