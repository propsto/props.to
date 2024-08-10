"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@propsto/ui/utils/cn";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  id: string;
  dark?: boolean;
  className?: string;
}

const tooltipVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4, // equivalent to translate-y-1
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export function Tooltip({
  children,
  content,
  id,
  dark = false,
  className,
}: TooltipProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "block text-left text-zinc-500 underline decoration-dotted underline-offset-4 cursor-help",
          dark ? "decoration-zinc-600 " : "decoration-zinc-300",
          className
        )}
        aria-describedby={`tooltip-${id}`}
        onMouseEnter={() => {
          setOpen(true);
        }}
        onMouseLeave={() => {
          setOpen(false);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
      >
        {children}
      </button>
      <div
        id={`tooltip-${id}`}
        role="tooltip"
        className="z-10 absolute top-full left-0"
      >
        <motion.div
          initial="initial"
          animate={open ? "enter" : "exit"}
          variants={tooltipVariants}
          className="w-[12.5rem] text-xs bg-white text-zinc-500 border border-zinc-200 px-3 py-2 rounded shadow-lg overflow-hidden mt-1"
        >
          {content}
        </motion.div>
      </div>
    </div>
  );
}
