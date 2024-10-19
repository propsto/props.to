import { type JSX } from "react";
import { Cta } from "@components/cta";
import { Features01 } from "@components/features-01";
import { Features02 } from "@components/features-02";
import { Features03 } from "@components/features-03";
import { Hero } from "@components/hero";
import { PricingTabs } from "@components/pricing-tabs";
import { Testimonials } from "@components/testimonials";

export default function HomePage(): JSX.Element {
  return (
    <>
      <Hero />
      <Features01 />
      <Features02 />
      <Features03 />
      <PricingTabs />
      <Testimonials />
      <Cta />
    </>
  );
}
