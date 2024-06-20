"use client";

import { useFormState, useFormStatus } from "react-dom";
import { SubmitButton } from "@propsto/ui/molecules";
import { requestEarlyAccess } from "./action";

export function Form(): JSX.Element {
  const [state, action] = useFormState(requestEarlyAccess, undefined);
  const { pending } = useFormStatus();
  return (
    <form action={action} id="webform" name="WebToLeads6106600000000449577">
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
            disabled={pending}
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
            disabled={pending}
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
            disabled={pending}
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
            disabled={pending}
            placeholder="Share your requirements"
            required
          />
        </div>
      </div>
      <div className="mt-5">
        <SubmitButton>Request early access</SubmitButton>
      </div>
    </form>
  );
}
