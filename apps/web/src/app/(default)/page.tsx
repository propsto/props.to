import { type JSX } from "react";
import { Features01 } from "@components/features-01";
import { Hero } from "@components/hero";
import { PricingTabs } from "@components/pricing-tabs";

export default function HomePage(): JSX.Element {
  return (
    <>
      <Hero />
      <Features01 />
      <PricingTabs />
    </>
  );
}
