"use client";

import { requestEarlyAccess } from "@/lib/actions/requestEarlyAccess";
import Community from "./community";
import FormButton from "@/components/formButton";
import { useRef, useState } from "react";
import Triangles from "@/components/triangles";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  async function osSubmit(formData: FormData) {
    const res = await requestEarlyAccess(formData);
    setMessage(res.message);
    setTimeout(() => {
      setMessage("");
      if (formRef.current) {
        formRef.current.reset();
      }
    }, 3000);
  }
  return (
    <>
      {/* Demo form */}
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <Triangles />
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="px-4 sm:px-6">
            {/* Page header */}
            <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-16">
              <h1 className="font-cal text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-900 pb-4">
                Request early access
              </h1>
              <p className="text-lg text-zinc-500">
                Complete the form and we'll make sure to reach out when the time
                comes to onboard you.
              </p>
            </div>

            {/* Form */}
            <div className="max-w-[25rem] mx-auto p-6 rounded-lg shadow-2xl bg-gradient-to-b from-zinc-100 to-zinc-50/70 relative before:absolute before:-top-12 before:-left-16 before:w-96 before:h-96 before:bg-zinc-900 before:opacity-[.15] before:rounded-full before:blur-3xl before:-z-10">
              <form
                action={osSubmit}
                id="webform"
                name="WebToLeads6106600000000449577"
                ref={formRef}
              >
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm text-zinc-800 font-medium mb-2"
                      htmlFor="First_Name"
                    >
                      First Name
                    </label>
                    <input
                      id="First_Name"
                      name="First Name"
                      className="form-input text-sm w-full"
                      type="text"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm text-zinc-800 font-medium mb-2"
                      htmlFor="Last_Name"
                    >
                      Last Name
                    </label>
                    <input
                      id="Last_Name"
                      name="Last Name"
                      className="form-input text-sm w-full"
                      type="text"
                      placeholder="Williams"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm text-zinc-800 font-medium mb-2"
                      htmlFor="Email"
                    >
                      Email
                    </label>
                    <input
                      id="Email"
                      name="Email"
                      className="form-input text-sm w-full"
                      type="email"
                      placeholder="john@acmecorp.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="Description"
                    >
                      Project Details
                    </label>
                    <textarea
                      id="Description"
                      name="Description"
                      className="form-textarea text-sm w-full"
                      rows={4}
                      placeholder="Share your requirements"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="mt-5">
                  <FormButton>{message || "Request early access"}</FormButton>
                </div>
              </form>

              <div className="text-center mt-6">
                <div className="text-xs text-zinc-500">
                  By submitting you agree with our{" "}
                  <a className="underline hover:no-underline" href="#0">
                    Terms
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
