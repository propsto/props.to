import { Hero } from "@components/hero";
import { Features01 } from "@components/features-01";
import { PricingTabs } from "@components/pricing-tabs";

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <Features01 />
      <PricingTabs />
    </>
  );
}
