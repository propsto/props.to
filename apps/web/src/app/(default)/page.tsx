import dynamicLoad from "next/dynamic";
import { PricingTabs } from "@components/pricing-tabs";
import { FAQs } from "@components/faqs";
import TheProblem from "@components/the-problem";
import RoleExplorer from "@components/role-explorer";
import HowItWorks from "@components/how-it-works";

const Hero = dynamicLoad(() =>
  import("@components/hero").then(mod => mod.Hero),
);
const TheSolution = dynamicLoad(() =>
  import("@components/the-solution").then(mod => mod.default),
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The props.to org's "website" entity link, set once it exists in production.
// Read per request (this page is dynamic); anything that isn't http(s) is ignored.
function diagramFeedbackUrl(): string | undefined {
  const raw = process.env.DIAGRAM_FEEDBACK_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString().replace(/\/$/, "")
      : undefined;
  } catch {
    return undefined;
  }
}

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <TheProblem />
      <TheSolution />
      <HowItWorks />
      <RoleExplorer feedbackUrl={diagramFeedbackUrl()} />
      <PricingTabs />
      <FAQs />
    </>
  );
}
