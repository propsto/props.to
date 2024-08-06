"use client";

import {
  ArrowRightLeftIcon,
  CloudUploadIcon,
  CogIcon,
  Fingerprint,
  LockKeyholeIcon,
  ServerIcon,
} from "lucide-react";

const features = [
  {
    name: "Push to deploy.",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.",
    icon: CloudUploadIcon,
  },
  {
    name: "SSL certificates.",
    description:
      "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.",
    icon: LockKeyholeIcon,
  },
  {
    name: "Simple queues.",
    description:
      "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.",
    icon: ArrowRightLeftIcon,
  },
  {
    name: "Advanced security.",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.",
    icon: Fingerprint,
  },
  {
    name: "Powerful API.",
    description:
      "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.",
    icon: CogIcon,
  },
  {
    name: "Database backups.",
    description:
      "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. ",
    icon: ServerIcon,
  },
];

export function Features01(): JSX.Element {
  return (
    <section className="relative bg-zinc-50">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-cal text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Key features
            </h2>
            <p className="text-lg text-zinc-500">
              Truly open source feedback platform thought to conquer the
              feedback world!
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-white">
                    <feature.icon
                      aria-hidden="true"
                      className="absolute left-1 top-1 h-5 w-5 text-indigo-500"
                    />
                    {feature.name}
                  </dt>{" "}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
