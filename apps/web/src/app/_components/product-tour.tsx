"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@propsto/ui/lib/utils";

// Captured from the app at 1440×900 (2x) against a demo copy of the seed data.
const screens = [
  {
    id: "give",
    label: "Give",
    address: "props.to/mikeryan/mike-props",
    caption:
      "Anyone with your link can leave feedback, signed or anonymous. No account needed.",
    src: "/images/app/give.png",
    alt: "The public page where someone gives Mike feedback through his link",
  },
  {
    id: "lead",
    label: "Lead",
    address: "app.props.to/org/acme",
    caption:
      "Each member sees their level and its expectations. Leads see the people they lead.",
    src: "/images/app/org-home.png",
    alt: "Daniel's company page showing his Senior level, the people he leads and his links",
  },
  {
    id: "moderate",
    label: "Moderate",
    address: "app.props.to/org/acme/admin/moderation",
    caption:
      "Feedback from outside the company waits for an admin before the recipient sees it.",
    src: "/images/app/moderate.png",
    alt: "Acme's moderation queue with feedback waiting to be approved or rejected",
  },
  {
    id: "talk",
    label: "Talk",
    address: "app.props.to/org/acme/people/janesmith/conversations",
    caption:
      "Leads turn what they observed into a conversation, with a value, shared notes and private ones.",
    src: "/images/app/talk.png",
    alt: "A lead's conversation about Jane, tagged Ownership, with a shared note and an internal note",
  },
  {
    id: "organize",
    label: "Organize",
    address: "app.props.to/org/acme/admin/values",
    caption:
      "Admins add the company's values, levels and groups. Each layer is optional.",
    src: "/images/app/values.png",
    alt: "Acme's values settings listing Ownership, Candor and Craft",
  },
] as const;

export function AppWindow({
  address,
  src,
  alt,
  priority,
}: Readonly<{
  address: string;
  src: string;
  alt: string;
  priority?: boolean;
}>): React.ReactElement {
  return (
    <figure className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
        <span aria-hidden className="size-2.5 rounded-full bg-zinc-300" />
        <span aria-hidden className="size-2.5 rounded-full bg-zinc-300" />
        <span aria-hidden className="size-2.5 rounded-full bg-zinc-300" />
        <span className="ml-3 truncate rounded-md border border-zinc-200 bg-white px-3 py-0.5 text-xs text-zinc-500">
          {address}
        </span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={2880}
        height={1800}
        sizes="(min-width: 1280px) 1152px, 100vw"
        priority={priority}
        className="h-auto w-full"
      />
    </figure>
  );
}

export default function ProductTour(): React.ReactElement {
  const [current, setCurrent] = useState<string>(screens[0].id);
  const screen = screens.find(s => s.id === current) ?? screens[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Tablist keyboard pattern: arrows move between tabs, Home/End jump to the
  // ends, and only the selected tab sits in the Tab order.
  function onTabKeyDown(e: React.KeyboardEvent, index: number): void {
    const last = screens.length - 1;
    let next: number;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setCurrent(screens[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="product" className="relative bg-white">
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            The product
          </p>
          <h2 className="mx-auto mt-2 mb-4 max-w-3xl text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            See it work.
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
            Real screens from the app, from the moment someone opens your link
            to the conversation that follows.
          </p>

          <div
            role="tablist"
            aria-label="Product screens"
            className="mb-4 flex flex-wrap justify-center gap-2"
          >
            {screens.map((s, i) => (
              <button
                key={s.id}
                ref={el => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={s.id === current}
                aria-controls="product-screen"
                tabIndex={s.id === current ? 0 : -1}
                onClick={() => setCurrent(s.id)}
                onKeyDown={e => onTabKeyDown(e, i)}
                className={cn(
                  "min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  s.id === current
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-zinc-300 bg-white text-gray-900 hover:bg-zinc-50",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p
            aria-live="polite"
            className="mx-auto mb-8 min-h-14 max-w-2xl text-center text-base text-balance text-gray-700"
          >
            {screen.caption}
          </p>

          <div
            id="product-screen"
            role="tabpanel"
            aria-labelledby={`tab-${screen.id}`}
          >
            <AppWindow
              key={screen.id}
              address={screen.address}
              src={screen.src}
              alt={screen.alt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
