import { Triangles } from "@propsto/ui/molecules/triangles";
import type { Metadata } from "next";
import { Form } from "./form";
import { Community } from "./community";

export const metadata: Metadata = {
  title: "Props.to - Request Early Access",
  description: "Open Source Feedback Platform",
};

export default function RequestEarlyAccess(): JSX.Element {
  return (
    <>
      <section className="relative overflow-hidden before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <Triangles />
        <div className="pt-28 pb-12 md:pt-32 md:pb-20">
          <div className="px-4 sm:px-6">
            {/* Page header */}
            <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-10">
              <h1 className="font-cal text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-900 pb-4">
                Request early access
              </h1>
              <p className="text-lg text-zinc-500">
                Complete the form and we&apos;ll make sure to reach out when the
                time comes to onboard you.
              </p>
            </div>

            <div className="max-w-[25rem] mx-auto p-6 rounded-lg shadow-2xl bg-gradient-to-b from-zinc-100 to-zinc-50/70 relative before:absolute before:-top-12 before:-left-16 before:w-96 before:h-96 before:bg-zinc-900 before:opacity-[.15] before:rounded-full before:blur-3xl before:-z-10">
              <Form />
              <div className="text-center mt-6">
                <div className="text-xs text-zinc-500">
                  By submitting you agree with our{" "}
                  <a
                    className="underline hover:no-underline"
                    href="https://docs.props.to/terms-and-conditions"
                  >
                    Terms & Conditions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Community />
    </>
  );
}
