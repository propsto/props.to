import {
  BadgeQuestionMarkIcon,
  CalendarX,
  HeartCrackIcon,
  HourglassIcon,
} from "lucide-react";

import { AutoHoverCards } from "./auto-hover-cards";

export default function TheProblem(): React.ReactElement {
  const supportingPoints = [
    {
      title: "There is no clear moment to ask for feedback",
      icon: <CalendarX className="size-6" />,
      backgroundClassName: "bubble-bg-5",
    },
    {
      title: "Giving feedback feels emotionally heavy",
      icon: <HeartCrackIcon className="size-6" />,
      backgroundClassName: "bubble-bg-4",
    },
    {
      title: "By the time feedback arrives, context is gone",
      icon: <BadgeQuestionMarkIcon className="size-6" />,
      backgroundClassName: "bubble-bg-3",
    },
    {
      title: "Client feedback is often requested too late to matter",
      icon: <HourglassIcon className="size-6" />,
      backgroundClassName: "bubble-bg-2",
    },
  ];

  return (
    <section className="relative bg-gray-50">
      <div className="py-16 sm:py-16">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            The Problem
          </p>
          <h2 className="mx-auto mt-2 mb-4 text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Feedback usually comes too late.
          </h2>

          {/* Body Copy */}
          <div className="mx-auto mb-16 max-w-3xl space-y-6 text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
            <p>
              When feedback arrives too late, it cannot influence decisions. At
              best, it becomes historical. At worst, it slows progress.
            </p>
            <p>
              People want to give meaningful feedback, but real life gets in the
              way. Meetings get postponed. Moments pass. The opportunity fades.
            </p>
            <p className="text-foreground/80">
              What remains is feedback that feels reactive, uncomfortable, or
              incomplete.
            </p>
          </div>

          {/* Supporting Points */}
          <AutoHoverCards
            cards={supportingPoints}
            alternate
            cardClassName="bg-white flex items-center"
            contentClassName="items-center"
            iconWrapperClassName="size-10"
            titleClassName="text-lg"
          />

          {/* Closing Line */}
          <div className="text-center">
            <p className="text-balance text-xl font-semibold italic text-foreground md:text-2xl">
              Timing is the hardest part of feedback.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
