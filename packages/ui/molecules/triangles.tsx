"use client";

import "./triangles.css";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, useState, useEffect, type MutableRefObject } from "react";
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
    parentRef?: MutableRefObject<HTMLElement | null>;
  } & TriangleVariantProps
>): JSX.Element {
  const [maxTileX, setMaxTileX] = useState(0);
  const [maxTileY, setMaxTileY] = useState(0);
  const [deviceWidth, deviceHeight] = useDeviceSize();
  const types = ["one", "two", "three"];
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
      {...Array.from(
        { length: maxTileX },
        (x, i): React.ReactNode =>
          Array.from({ length: maxTileY }, (y, j): React.ReactNode => {
            return (
              <div
                className={`triangle ${types[Math.floor(Math.random() * 3)]}`}
                key={`${i.toString()}${j.toString()}`}
              />
            );
          }),
      )}
    </div>
  );
}
