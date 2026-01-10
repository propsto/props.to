import dynamicLoad from "next/dynamic";
import { PricingTabs } from "@components/pricing-tabs";
import { FAQs } from "@components/faqs";
import TheProblem from "@components/the-problem";
import UseCases from "@components/use-cases";

const Hero = dynamicLoad(() =>
  import("@components/hero").then(mod => mod.Hero),
);
const TheSolution = dynamicLoad(() =>
  import("@components/the-solution").then(mod => mod.default),
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <TheProblem />
      <TheSolution />
      <UseCases />
      <PricingTabs />
      <FAQs />
    </>
  );
}
