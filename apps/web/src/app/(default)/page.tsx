import { Hero } from "@components/hero";
import { PricingTabs } from "@components/pricing-tabs";
import BentoGrid from "@components/bento-grid";
import { FAQs } from "@components/faqs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <BentoGrid />
      <PricingTabs />
      <FAQs />
    </>
  );
}
