import dynamicLoad from "next/dynamic";
import { PricingTabs } from "@components/pricing-tabs";
import { FAQs } from "@components/faqs";
import TheProblem from "@components/the-problem";
import HowItWorks from "@components/how-it-works";
import ProductTour from "@components/product-tour";
import Portability from "@components/portability";

const Hero = dynamicLoad(() =>
  import("@components/hero").then(mod => mod.Hero),
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Props.to",
  url: "https://props.to",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Open-source feedback and recognition platform with personal feedback links that people keep across jobs, plus optional company layers for values, levels and moderation.",
  license: "https://www.gnu.org/licenses/agpl-3.0.html",
  offers: [
    { "@type": "Offer", name: "Personal", price: "0", priceCurrency: "USD" },
    {
      "@type": "Offer",
      name: "Company, hosted",
      price: "4",
      priceCurrency: "USD",
      description: "Per member a month after a free 3-month pilot",
    },
  ],
};

export default function HomePage(): React.ReactElement {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TheProblem />
      <ProductTour />
      <HowItWorks feedbackUrl={diagramFeedbackUrl()} />
      <Portability />
      <PricingTabs />
      <FAQs />
    </>
  );
}
