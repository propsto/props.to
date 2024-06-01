"use client";

import useDeviceSize from "../hooks/use-device-size";

export function Triangles() {
  const [width = 500, height = 700] = useDeviceSize();
  const size = 60;
  const maxTileX = Math.ceil(width / size),
    maxTileY = Math.ceil(height / size);
  const types = [
    "border-t-0 border-r-[80px] border-b-[80px] border-l-0 origin-[40px 0px] border-t-transparent border-r-zinc-900/80 border-b-transparent border-l-transparent",
    "borcer-t-0 border-r-0 border-b-[80px] border-l-[80px] origin-[40px 40px] border-t-transparent border-r-transparent border-b-zinc-900/70 border-l-transparent",
    "border-t-[80px] border-r-0 border-b-0 border-l-[80px] origin-[0px 40px] border-t-transparent border-r-transparent border-b-transparent border-l-zinc-900/70",
  ];
  return (
    <div className="absolute w-screen h-full overflow-hidden top-0 left-0 -ml-48">
      {...Array.from(
        { length: maxTileX },
        (x, i): React.ReactNode =>
          Array.from({ length: maxTileY }, (y, j): React.ReactNode => {
            return (
              <div
                className={`triangle scale-0 size-0 float-right animate-grow border-solid ${types[Math.floor(Math.random() * 3)]}`}
                key={`${i.toString()}${j.toString()}`}
              />
            );
          })
      )}
    </div>
  );
}
