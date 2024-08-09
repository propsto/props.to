"use client";

import { cn } from "@propsto/ui/utils/cn";
import { CheckCircle2, CircleDollarSign, X } from "lucide-react";
import { Tooltip } from "./tooltip";

const features = [
  "Public user profile",
  "Embedding capabilities",
  "Customize profile design",
  "Custom feedback links in profile",
  "API access",
  "Single social network integration",
  "Additional integrations",
  "Custom feedback values",
  "App store",
  "Single Sign-On",
  "AI assistence",
  "White labeling",
  "Workflows",
] as const;

type FixedLengthTuple<T extends readonly unknown[], U> = {
  [K in keyof T]: U;
};

type FeaturesTuple = FixedLengthTuple<typeof features, 0 | 1 | "paid">;

interface Tier {
  price: string;
  priceSubtitle: string;
  features: FeaturesTuple;
  highlight?: string;
  footer: string;
}

const tiers: Record<string, Tier> = {
  INDIVIDUAL: {
    price: "Free",
    priceSubtitle: "Free for ever",
    features: [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, "paid"],
    highlight: "MVP",
    footer: "Literally you probably haven't heard of them jean shorts.",
  },
  ORGANIZATION: {
    price: "TBD",
    priceSubtitle: "a.k.a. hosted (company.props.to)",
    features: [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    //highlight: "MVP",
    footer: "Literally you probably haven't heard of them jean shorts.",
  },
  ENTERPRISE: {
    price: "TBD",
    priceSubtitle: "a.k.a hosted/self-hosted license",
    features: [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    //highlight: "MVP",
    footer: "Literally you probably haven't heard of them jean shorts.",
  },
};

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
          <section className="text-gray-700 body-font overflow-hidden">
            <div className="container px-5 py-24 mx-auto flex flex-wrap">
              <div className="lg:w-1/4 mt-48 hidden lg:block">
                <div className="mt-px border-t border-gray-300 border-b border-l rounded-tl-lg rounded-bl-lg overflow-hidden">
                  {features.map((feat, index) => (
                    <p
                      // eslint-disable-next-line react/no-array-index-key -- fixed items in array
                      key={index}
                      className={cn(
                        "text-gray-900 h-12 text-center px-4 flex items-center justify-start",
                        index === 0 && "-mt-px",
                        index % 2 === 0 && "bg-gray-100"
                      )}
                    >
                      {feat}
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
                      {tier.features.map((featState, indexState) => (
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
                            {features[indexState]}&nbsp;
                          </span>
                          {featState === 1 && (
                            <CheckCircle2 className="size-5" />
                          )}
                          {featState === 0 && <X className="size-5" />}
                          {featState === "paid" && (
                            <Tooltip
                              content="Extra"
                              id={`paid${indexState.toString()}`}
                            >
                              <CircleDollarSign
                                className="size-5 text-gray-600"
                                aria-label="Extra"
                              />
                            </Tooltip>
                          )}
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
