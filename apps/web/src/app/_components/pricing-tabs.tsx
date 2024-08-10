"use client";

import { cn } from "@propsto/ui/utils/cn";
import { CheckCircle2, CircleDollarSign, X } from "lucide-react";
import { Tooltip } from "./tooltip";

interface Tier {
  price: string;
  priceSubtitle: string;
  highlight?: string;
  footer: string;
}

const tiers: Record<string, Tier> = {
  INDIVIDUAL: {
    price: "Free",
    priceSubtitle: "Free for ever",
    highlight: "MVP",
    footer: "Working on it right now. Be sure to request early access!",
  },
  ORGANIZATION: {
    price: "TBD",
    priceSubtitle: "a.k.a. hosted (company.props.to)",
    footer: "This will come as the first expansion of the MVP.",
  },
  ENTERPRISE: {
    price: "TBD",
    priceSubtitle: "a.k.a hosted/self-hosted license",
    footer:
      "After the first expansion, this should not be that much additional work.",
  },
};

// Define the FeaturesState type
type FeaturesState = "no" | "yes" | "paid";

// Create a utility type to construct a tuple of the same length as the keys of an object
type FixedLengthTuple<T extends readonly string[], U> = {
  [K in keyof T]: U;
};

// Extract the keys of the tiers object as a tuple of strings
type TierKeys = keyof typeof tiers extends infer K ? K[] : never;

// Create a TiersTuple type using the keys of the `tiers` object
type TiersTuple = FixedLengthTuple<
  TierKeys,
  FeaturesState | [FeaturesState, string]
>;

// Define the FeatureItem type
type FeatureItem = [string, TiersTuple];

const features: FeatureItem[] = [
  ["Public user profile", ["yes", "yes", "yes"]],
  ["Embedding capabilities", ["yes", "yes", "yes"]],
  ["Customize profile design", ["paid", "yes", "yes"]],
  ["Custom feedback links in profile", ["paid", "yes", "yes"]],
  [
    "Integrate other props.to instances",
    [
      "yes",
      [
        "no",
        "No third-party props.to is thought to be integrated in this tier",
      ],
      [
        "no",
        "No third-party props.to is thought to be integrated in this tier",
      ],
    ],
  ],
  ["API access", ["paid", "yes", "yes"]],
  [
    "Single social network integration",
    [
      "yes",
      [
        "no",
        "Personal feedback from social networks only allowed outside organizations",
      ],
      [
        "no",
        "Personal feedback from social networks only allowed outside organizations",
      ],
    ],
  ],
  ["Additional integrations", ["paid", "yes", "yes"]],
  [
    "Custom feedback values",
    ["no", ["yes", "High-level"], ["yes", "Low-level"]],
  ],
  ["App store", ["yes", "yes", "yes"]],
  ["Single Sign-On", ["no", "yes", "yes"]],
  ["AI assistence", ["no", "yes", "yes"]],
  ["White labeling", ["no", "yes", "yes"]],
  ["Workflows", ["no", "no", "yes"]],
] as const;

function FeatureState({
  state,
  recursion,
}: {
  state: FeaturesState | [FeaturesState, string];
  recursion?: boolean;
}): React.ReactNode {
  return (
    <>
      {state === "yes" && <CheckCircle2 className="size-5 mb-0.5" />}
      {state === "no" && (
        <X className={cn("size-5", recursion ? "mb-px" : "mb-0.5")} />
      )}
      {state === "paid" && (
        <Tooltip
          content="Extra fee"
          id={`paid${Math.random().toString()}`}
          className="no-underline"
        >
          <div className="flex border-b border-dotted border-gray-500">
            <CircleDollarSign className="size-5 text-gray-600 mb-0.5" />
            <span className="text-sm">*</span>
          </div>
        </Tooltip>
      )}
      {typeof state === "object" ? (
        <Tooltip
          content={state[1]}
          id={`paid${Math.random().toString()}`}
          className="no-underline"
        >
          <div className="flex border-b border-dotted border-gray-500">
            <FeatureState state={state[0]} recursion />
            <span className="text-sm">*</span>
          </div>
        </Tooltip>
      ) : null}
    </>
  );
}

export function PricingTabs(): JSX.Element {
  return (
    <section>
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="font-cal text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              There&apos;s a plan for everyone
            </h2>
            <p className="text-lg text-zinc-500">
              Start claiming your received feedback. Upgrade to get extra
              features and buy a license to get them in a self-hosted props.to.
            </p>
          </div>

          {/* Pricing tabs component */}
          <section className="text-gray-700 body-font">
            <div className="container px-5 py-24 mx-auto flex flex-wrap">
              <div className="lg:w-1/4 mt-48 hidden lg:block">
                <div className="mt-px border-t border-gray-300 border-b border-l rounded-tl-lg rounded-bl-lg overflow-hidden">
                  {features.map((feat, index) => (
                    <p
                      // eslint-disable-next-line react/no-array-index-key -- fixed items in array
                      key={index}
                      className={cn(
                        "text-gray-900 h-12 px-4 flex items-center justify-start",
                        index === 0 && "-mt-px",
                        index % 2 === 0 && "bg-gray-100"
                      )}
                    >
                      {feat[0]}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex lg:w-3/4 w-full flex-wrap rounded-lg">
                {Object.keys(tiers).map((tierKey, index) => {
                  const tier = tiers[tierKey];
                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key -- fixed items in array
                      key={index}
                      className={cn(
                        "lg:w-1/3 w-full rounded-lg mb-10",
                        tier.highlight
                          ? "border-2 border-gray-800 relative"
                          : "border-gray-300",
                        !tier.highlight &&
                          "border-r border-b border-t border-l",
                        index !== 0 && !tier.highlight && "lg:border-l-0"
                      )}
                    >
                      {tier.highlight ? (
                        <span className="bg-gray-800 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl rounded-tr">
                          {tier.highlight}
                        </span>
                      ) : null}
                      <div className="px-2 text-center h-48 flex flex-col items-center justify-center">
                        <h3 className="tracking-widest">{tierKey}</h3>
                        <h2 className="text-5xl text-gray-900 font-medium flex items-center justify-center leading-none mb-4 mt-2">
                          {tier.price}
                        </h2>
                        <span className="text-sm text-gray-600">
                          {tier.priceSubtitle}
                        </span>
                      </div>
                      {features.map((featState, indexState) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key -- fixed items in array
                          key={index}
                          className={cn(
                            "text-gray-600 h-12 flex items-center justify-center",
                            indexState === 0 && "border-t border-gray-300",
                            tier.highlight && indexState === 0 && "-mt-px",
                            indexState % 2 === 0 && "bg-gray-100"
                          )}
                        >
                          <span className="lg:hidden font-bold">
                            {featState[0]}&nbsp;
                          </span>
                          <FeatureState state={featState[1][index]} />
                        </div>
                      ))}
                      <div className="p-6 text-center border-t border-gray-300">
                        <p className="text-xs text-gray-500 mt-3">
                          {tier.footer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
