"use client";

import { type MutableRefObject } from "react";
import { useDeviceSize } from "../hooks/use-device-size";

export function Triangles({
  parentRef,
}: {
  parentRef?: MutableRefObject<HTMLElement | null>;
}) {
  const [deviceWidth, deviceHeight] = useDeviceSize();
  const [width, height] = parentRef?.current
    ? [parentRef.current.offsetWidth, parentRef.current.offsetHeight]
    : [deviceWidth, deviceHeight];
  const size = 80;
  const maxTileX = Math.ceil(width / size),
    maxTileY = Math.ceil(height / size);
  const types = ["one", "two", "three"];
  return (
    <div className="absolute overflow-hidden top-0 left-0 flex flex-wrap">
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
          })
      )}
    </div>
  );
}
