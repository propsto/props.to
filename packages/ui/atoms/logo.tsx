import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../lib/utils";

export type LogoVariantProps = VariantProps<typeof logoVariants>;
const logoVariants = cva("", {
  variants: {
    size: {
      xl: "size-9",
      lg: "size-7",
      default: "size-6",
      sm: "size-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function Logo({
  className,
  size = "default",
}: Readonly<{ className?: string } & LogoVariantProps>): React.ReactElement {
  return (
    <img
      src="https://props.to/logo-color-rounded.png"
      alt="Props.to Logo"
      className={cn(logoVariants({ size, className }))}
    />
  );
}
