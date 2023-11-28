export const metadata = {
  title: "Home - Props to",
  description: "Team appraisal and engagement platform",
};

import Hero from "@/components/hero";
import Section01 from "@/components/section-01";
import Section02 from "@/components/section-02";
import Section03 from "@/components/section-03";
import Section04 from "@/components/section-04";
import Section05 from "@/components/section-05";
import Section06 from "@/components/section-06";
import Section07 from "@/components/section-07";
import Faqs from "@/components/faqs";
import Cta from "@/components/cta";

export default async function Home() {
  return (
    <>
      <Hero />
      <Section01 />
      <Section02 />
      <Section03 />
      <Section04 />
      <Section05 />
      <Section06 />
      <Section07 />
      <Faqs />
      <Cta />
    </>
  );
}
