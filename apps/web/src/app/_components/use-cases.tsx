"use client";

import {
  CalendarArrowUpIcon,
  ChartSplineIcon,
  CircleGaugeIcon,
  ExternalLinkIcon,
  EyeIcon,
  GroupIcon,
  LinkIcon,
  MapPinIcon,
  MessageSquareOffIcon,
  MessagesSquareIcon,
  SpeechIcon,
  UserCheckIcon,
} from "lucide-react";
import { useState, useEffect, useLayoutEffect, useRef } from "react";

import { AutoHoverCards } from "./auto-hover-cards";

const useCases = [
  {
    id: "teams",
    label: "Teams",
    title: "Feedback without waiting for meetings.",
    body: [
      "Teams rely heavily on scheduled conversations to exchange feedback.",
      "One on ones. Reviews. Retrospectives.",
      "But most feedback does not happen on a calendar.",
      "Props.to enables feedback to happen asynchronously, while the work is still recent and relevant.",
    ],
    points: [
      { text: "Capture feedback outside meetings", icon: CalendarArrowUpIcon },
      {
        text: "Reduce emotional pressure in conversations",
        icon: CircleGaugeIcon,
      },
      { text: "Support one on ones with real signals", icon: SpeechIcon },
      {
        text: "Encourage continuous improvement, not yearly reviews",
        icon: ChartSplineIcon,
      },
    ],
    closing: "Better conversations start with better timing.",
  },
  {
    id: "clients",
    label: "Clients",
    title: "Client feedback without friction.",
    body: [
      "Scoped feedback increases response rates by making requests small and intentional.",
      "Client feedback is valuable, but difficult to collect.",
      "Logins, onboarding, and long forms reduce response rates. By the time feedback arrives, projects may already be finished.",
      "Props.to removes barriers between clients and feedback.",
      "Clients respond more when feedback is scoped, quick, and respectful of their time.",
    ],
    points: [
      { text: "Send a simple link by email or chat", icon: LinkIcon },
      { text: "No account creation required", icon: UserCheckIcon },
      { text: "One link per project or client", icon: MessagesSquareIcon },
      { text: "Feedback grouped and easy to revisit", icon: GroupIcon },
    ],
    closing: "Clients respond more when feedback is effortless.",
  },
  {
    id: "communities",
    label: "Communities",
    title: "Context-specific feedback, right when it matters.",
    body: [
      "Context helps people give feedback that is respectful of time and role boundaries.",
      "Communities gather around events and projects.",
      "Feedback is relevant in the moment but hard to capture later.",
      "Props.to supports short lived feedback requests tied to specific contexts.",
    ],
    points: [
      {
        text: "Share scoped feedback links after talks, workshops, or events",
        icon: ExternalLinkIcon,
      },
      {
        text: "Close the link once the event ends",
        icon: MessageSquareOffIcon,
      },
      {
        text: "Create focused feedback for specific projects or initiatives",
        icon: EyeIcon,
      },
      {
        text: "Feedback remains tied to context instead of general channels",
        icon: MapPinIcon,
      },
    ],
    closing: "Communities thrive on timely, context rich feedback.",
  },
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState("teams");
  const [animationKey, setAnimationKey] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [maxContentHeight, setMaxContentHeight] = useState<number | null>(null);
  const measureRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeCase = useCases.find(uc => uc.id === activeTab) || useCases[0];

  const getSupportingCards = (useCase: (typeof useCases)[number]) =>
    useCase.points.map((point, index) => ({
      title: point.text,
      icon: <point.icon className="size-6" />,
      backgroundClassName: `bubble-bg-${5 - index}`,
      titleClassName: index % 2 === 0 ? "text-right" : undefined,
    }));

  const renderUseCaseContent = (
    useCase: (typeof useCases)[number],
    autoRotateCards = true,
  ) => (
    <>
      <h2 className="mb-12 text-balance text-center text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        {useCase.title}
      </h2>
      <div className="mx-auto mb-16 max-w-3xl space-y-6 text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
        {useCase.body.map((paragraph, index) => (
          <p
            key={index}
            className={
              index === useCase.body.length - 2 ? "text-foreground/90" : ""
            }
          >
            {paragraph.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < paragraph.split("\n").length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>
      <AutoHoverCards
        cards={getSupportingCards(useCase)}
        alternate
        autoRotate={autoRotateCards}
        cardClassName="bg-white flex items-center"
        contentClassName="items-center"
        iconWrapperClassName="size-10"
      />
      <div className="text-center">
        <p className="text-balance text-xl font-semibold italic text-foreground md:text-2xl">
          {useCase.closing}
        </p>
      </div>
    </>
  );

  useLayoutEffect(() => {
    const measureMaxHeight = () => {
      const heights = useCases.map(
        useCase =>
          measureRefs.current[useCase.id]?.getBoundingClientRect().height || 0,
      );
      const nextHeight = Math.max(...heights);
      if (nextHeight && nextHeight !== maxContentHeight) {
        setMaxContentHeight(nextHeight);
      }
    };

    const raf = requestAnimationFrame(measureMaxHeight);
    const handleResize = () => {
      requestAnimationFrame(measureMaxHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [maxContentHeight]);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);

    if (!isAutoRotating) return;

    const tabInterval = setInterval(() => {
      setActiveTab(current => {
        const currentIndex = useCases.findIndex(uc => uc.id === current);
        const nextIndex = (currentIndex + 1) % useCases.length;
        return useCases[nextIndex].id;
      });
    }, 8000);

    return () => {
      clearInterval(tabInterval);
    };
  }, [activeTab, isAutoRotating]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsAutoRotating(false);
  };

  return (
    <section className="relative bg-gray-50">
      <div className="py-16 sm:py-16">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          {/* Section Label */}
          <div className="mb-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Use Cases
            </span>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-12 flex justify-center">
            <div className="inline-flex rounded-xl border bg-muted/30 p-1">
              {useCases.map(useCase => (
                <button
                  key={useCase.id}
                  onClick={() => handleTabClick(useCase.id)}
                  className={`relative overflow-hidden rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                    activeTab === useCase.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {useCase.label}
                  {activeTab === useCase.id && isAutoRotating && (
                    <div
                      key={animationKey}
                      className="absolute bottom-0 left-0 h-0.5 w-0 animate-progress bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Content */}
          <div
            className="relative"
            style={
              maxContentHeight
                ? { minHeight: `${maxContentHeight}px` }
                : undefined
            }
          >
            <div className="animate-in fade-in duration-300" key={activeTab}>
              {renderUseCaseContent(activeCase)}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 w-full opacity-0"
            >
              {useCases.map(useCase => (
                <div
                  key={useCase.id}
                  ref={node => {
                    measureRefs.current[useCase.id] = node;
                  }}
                >
                  {renderUseCaseContent(useCase, false)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
