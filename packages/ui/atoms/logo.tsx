import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../utils/cn";

export type LogoVariantProps = VariantProps<typeof logoVariants>;
const logoVariants = cva("", {
  variants: {
    size: {
      large: "size-7",
      default: "size-6",
      mini: "size-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function Logo({
  className,
  size = "default",
}: Readonly<{ className?: string } & LogoVariantProps>): JSX.Element {
  return (
    <svg
      className={cn("text-black", logoVariants({ size, className }))}
      fill="#171A20"
      viewBox="0 0 1680 1680"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>props.to logo</title>
      <g filter="url(#a)">
        <rect
          fill="url(#b)"
          height="1536"
          rx="348"
          width="1536"
          x="72"
          y="60"
        />
        <rect
          height="1524"
          rx="342"
          stroke="#fff"
          strokeOpacity=".12"
          strokeWidth="12"
          width="1524"
          x="78"
          y="66"
        />
        <g filter="url(#c)">
          <path
            d="M823.495 801.244c-45.508 130.4-121.482 332.706-364.826 490.096-3.887 2.51-9.144 1.2-11.469-2.8-22.851-39.34-51.756-68.45-84.483-89.98-5.694-3.74-5.013-12.69 1.233-15.41 138.995-60.66 388.07-295.667 390.642-815.03.021-4.418 3.601-8.12 8.02-8.12h121.346c4.315 0 7.854 3.532 8.019 7.844 19.474 511.111 282.603 751.646 425.493 815.626 5.98 2.67 6.87 11.21 1.72 15.25-27.36 21.44-61.6 58.7-76.5 89.03-2.12 4.31-7.42 6.24-11.63 3.95-244.424-133.21-346.737-358.408-392.256-490.381-2.498-7.243-12.784-7.309-15.309-.075"
            fill="#fff"
          />
        </g>
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="1680"
          id="a"
          width="1680"
          x="0"
          y="0"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="36" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.054902 0 0 0 0 0.188235 0 0 0 0 0.411765 0 0 0 0.3 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2_41" />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_2_41"
            result="shape"
          />
        </filter>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="1076.51"
          id="c"
          width="1090.31"
          x="295.54"
          y="308.219"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="28.767" />
          <feGaussianBlur stdDeviation="31.644" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2_41" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="27" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend
            in2="effect1_dropShadow_2_41"
            result="effect2_dropShadow_2_41"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect2_dropShadow_2_41"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-11.507" />
          <feGaussianBlur stdDeviation="20.137" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0" />
          <feBlend in2="shape" result="effect3_innerShadow_2_41" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-51.781" />
          <feGaussianBlur stdDeviation="46.027" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0.576471 0 0 0 0 0.619608 0 0 0 0 0.694118 0 0 0 1 0" />
          <feBlend
            in2="effect3_innerShadow_2_41"
            result="effect4_innerShadow_2_41"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feMorphology
            in="SourceAlpha"
            radius="3"
            result="effect5_innerShadow_2_41"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="18" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend
            in2="effect4_innerShadow_2_41"
            result="effect5_innerShadow_2_41"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feMorphology
            in="SourceAlpha"
            radius="3"
            result="effect6_innerShadow_2_41"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="18" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend
            in2="effect5_innerShadow_2_41"
            result="effect6_innerShadow_2_41"
          />
        </filter>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="b"
          x1="840"
          x2="840"
          y1="60"
          y2="1596"
        >
          <stop stopColor="#171A20" />
          <stop offset="1" stopColor="#3D4550" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoSymbol({
  className,
  size = "default",
}: Readonly<{ className?: string } & LogoVariantProps>): JSX.Element {
  return (
    <svg
      className={cn(logoVariants({ size, className }))}
      fill="none"
      viewBox="0 0 1680 1680"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>props.to logo</title>
      <g>
        <rect height="1536" rx="348" width="1536" x="72" y="60" />
        <g>
          <path
            d="M823.495 801.244c-45.508 130.4-121.482 332.706-364.826 490.096-3.887 2.51-9.144 1.2-11.469-2.8-22.851-39.34-51.756-68.45-84.483-89.98-5.694-3.74-5.013-12.69 1.233-15.41 138.995-60.66 388.07-295.667 390.642-815.03.021-4.418 3.601-8.12 8.02-8.12h121.346c4.315 0 7.854 3.532 8.019 7.844 19.474 511.111 282.603 751.646 425.493 815.626 5.98 2.67 6.87 11.21 1.72 15.25-27.36 21.44-61.6 58.7-76.5 89.03-2.12 4.31-7.42 6.24-11.63 3.95-244.424-133.21-346.737-358.408-392.256-490.381-2.498-7.243-12.784-7.309-15.309-.075"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
}
