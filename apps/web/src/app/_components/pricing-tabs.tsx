import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@propsto/ui/lib/utils";
import { Button } from "@propsto/ui/atoms/button";

interface Tier {
  name: string;
  badge?: string;
  price: string;
  priceNote: string;
  detail?: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Personal",
    price: "Free",
    priceNote: "forever",
    features: [
      "Your own feedback links",
      "Signed or anonymous feedback",
      "Keep your feedback across companies",
    ],
    cta: { label: "Request early access", href: "/request-early-access" },
  },
  {
    name: "Company, hosted",
    badge: "Pilot open",
    price: "Free",
    priceNote: "for 3 months",
    detail: "Then US$4 per member a month. Owners and admins are free.",
    features: [
      "Everything in Personal",
      "Values, levels and escalation layers",
      "Groups, leads and conversations",
      "Moderation and Google Workspace sign-in",
    ],
    cta: { label: "Join the pilot", href: "/request-early-access" },
    featured: true,
  },
  {
    name: "Company, self-hosted",
    price: "Let's talk",
    priceNote: "license",
    features: [
      "Everything in Company, hosted",
      "Runs on your own infrastructure",
      "Open source under AGPL-3.0",
    ],
    cta: { label: "View on GitHub", href: "https://git.new/propsto" },
  },
];

export function PricingTabs(): React.ReactElement {
  return (
    <section id="pricing" className="relative bg-white">
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            Pricing
          </p>
          <h2 className="mx-auto mt-2 mb-4 text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Choose your own feedback experience.
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-balance text-muted-foreground md:text-xl">
            Not everyone needs continuous feedback. Props.to adapts to different
            working styles.
          </p>

          <div className="grid gap-6 lg:grid-cols-3">
            {tiers.map(tier => (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col gap-6 rounded-xl border bg-white p-8",
                  tier.featured
                    ? "border-2 border-primary shadow-xl"
                    : "border-zinc-200",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-950">
                    {tier.name}
                  </h3>
                  {tier.badge ? (
                    <span
                      style={{
                        backgroundColor: "var(--bubble-color-0-hex-full)",
                      }}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-primary uppercase"
                    >
                      {tier.badge}
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="flex items-baseline gap-2">
                    <span className="font-cal text-4xl text-gray-950">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">
                      {tier.priceNote}
                    </span>
                  </p>
                  {tier.detail ? (
                    <p className="mt-2 text-sm text-gray-700">{tier.detail}</p>
                  ) : null}
                </div>
                <ul className="space-y-3 text-gray-700">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex gap-3">
                      <CheckCircle2
                        aria-hidden
                        className="mt-0.5 size-5 shrink-0 text-gray-950"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={tier.featured ? "default" : "outline"}
                  className="mt-auto"
                >
                  <Link href={tier.cta.href}>{tier.cta.label}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
