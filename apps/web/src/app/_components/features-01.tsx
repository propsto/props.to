"use client";

import {
  BaggageClaim,
  BookOpenCheck,
  GlobeIcon,
  Infinity,
  MousePointerClick,
  PanelsTopLeft,
} from "lucide-react";

const features = [
  {
    name: "Wide open.",
    description:
      "Open-source, expandable, customizable, and secure feedback platform.",
    icon: BookOpenCheck,
  },
  {
    name: "Embeddable.",
    description:
      "Display feedback on your personal or product site with a code snippet.",
    icon: PanelsTopLeft,
  },
  {
    name: "Claim what's yours.",
    description:
      "Claim URIs to claim the feedback your received in the platform.",
    icon: BaggageClaim,
  },
  {
    name: "Universal.",
    description:
      "Leave feedback to any valid URI such as social profiles, emails, any platform videos, etc.",
    icon: GlobeIcon,
  },
  {
    name: "Actionable.",
    description:
      "Create custom feedback categories for targeted feedback in your props.to profile.",
    icon: MousePointerClick,
  },
  {
    name: "Infinite.",
    description:
      "Consolidate feedback from organizations or self-hosted props.to instances in your public profile.",
    icon: Infinity,
  },
];

export function Features01(): React.ReactElement {
  return (
    <section className="relative [background:linear-gradient(#323237,#323237)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700),theme(colors.zinc.700))_border-box]">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-cal text-3xl md:text-4xl font-bold text-gray-200 mb-4">
              Key features
            </h2>
            <p className="text-lg text-zinc-200">
              Truly open source feedback platform thought to conquer the
              feedback world!
            </p>
          </div>
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map(feature => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-300">
                      <feature.icon
                        aria-hidden="true"
                        className="h-6 w-6 text-black"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-300">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
