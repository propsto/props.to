"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@propsto/ui/lib/utils";

interface Card {
  title: string;
  delay?: string;
  icon?: ReactNode | "x" | "check";
  backgroundClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
  iconWrapperClassName?: string;
  titleClassName?: string;
}

interface AutoHoverCardsProps {
  cards: Card[];
  rotationInterval?: number;
  autoRotate?: boolean;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
  iconWrapperClassName?: string;
  titleClassName?: string;
  alternate?: boolean;
}

export function AutoHoverCards({
  cards,
  rotationInterval = 2000,
  autoRotate = true,
  className,
  cardClassName,
  contentClassName,
  iconWrapperClassName,
  titleClassName,
  alternate = false,
}: AutoHoverCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || cards.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % cards.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, cards.length, rotationInterval]);

  return (
    <div className={cn("mb-16 grid gap-6 md:grid-cols-2", className)}>
      {cards.map((card, index) => {
        const isAlternate = alternate && index % 2 === 0;
        const iconContent =
          card.icon === "x" ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : card.icon === "check" ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            card.icon
          );

        return (
          <div
            key={index}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg",
              {
                "border-primary/50 shadow-lg": activeIndex === index,
                "justify-end": isAlternate,
                "justify-start": alternate && !isAlternate,
              },
              cardClassName,
              card.cardClassName,
            )}
            style={card.delay ? { animationDelay: card.delay } : undefined}
          >
            <div
              className={cn(
                "absolute inset-0 transition-opacity group-hover:opacity-100",
                card.backgroundClassName
                  ? "opacity-0"
                  : "bg-gradient-to-br from-primary/5 to-transparent",
                {
                  "opacity-100": activeIndex === index,
                  "opacity-0": activeIndex !== index,
                },
                card.backgroundClassName,
              )}
            />
            <div
              className={cn(
                "relative flex items-start gap-4",
                {
                  "md:flex-row-reverse": isAlternate,
                },
                contentClassName,
                card.contentClassName,
              )}
            >
              {iconContent ? (
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
                    iconWrapperClassName,
                    card.iconWrapperClassName,
                  )}
                >
                  {iconContent}
                </div>
              ) : null}
              <p
                className={cn(
                  "text-base font-medium leading-relaxed text-foreground",
                  titleClassName,
                  card.titleClassName,
                )}
              >
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
