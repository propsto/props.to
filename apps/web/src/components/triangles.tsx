import { useEffect } from "react";
import useDeviceSize from "@/lib/useDeviceSize";

import gsap from "gsap";

export default function Triangles() {
  const [width, height] = useDeviceSize();
  var size = 70;
  var maxTileX = Math.ceil(width / size),
    maxTileY = Math.ceil(height / size);
  var types = ["TL", "TR", "BL", "BR"];
  useEffect(() => {
    if (maxTileX > 0 && maxTileY > 0) {
      gsap.to(`.triangle`, {
        scale: 1,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2.5,
      });
    }
  }, []);
  return (
    <div id="container" className="absolute w-full h-full overflow-hidden">
      {[...Array(maxTileX)].map((x, i) =>
        [...Array(maxTileY)].map((y, j) => {
          return (
            <div
              key={`${i}${j}`}
              className={`triangle ${types[Math.floor(Math.random() * 4)]}`}
            />
          );
        })
      )}
    </div>
  );
}
