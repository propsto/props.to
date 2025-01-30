"use client";

import { Button, Input, Textarea } from "@propsto/ui/atoms";
import { useResetableActionState } from "@propsto/ui/hooks/use-resetable-action-state";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { requestEarlyAccess } from "./action";

export function Form(): React.ReactElement {
  const [result, action, isPending] = useResetableActionState(
    requestEarlyAccess,
    undefined,
  );

  return (
    <form
      action={action}
      id="webform6515163000000615003"
      name="WebToLeads6515163000000615003"
    >
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm text-zinc-800 font-medium mb-2"
            htmlFor="First_Name"
          >
            First Name
          </label>
          <Input
            id="First_Name"
            name="First Name"
            type="text"
            placeholder="John"
            defaultValue={result?.values?.["First Name"] ?? ""}
            disabled={isPending}
          />
          {result?.errors?.["First Name"] ? (
            <p className="text-sm text-left text-red-500">
              {result.errors["First Name"]}
            </p>
          ) : null}
        </div>
        <div>
          <label
            className="block text-sm text-zinc-800 font-medium mb-2"
            htmlFor="Last_Name"
          >
            Last Name
          </label>
          <Input
            id="Last_Name"
            name="Last Name"
            type="text"
            defaultValue={result?.values?.["Last Name"] ?? ""}
            disabled={isPending}
            placeholder="Williams"
          />
          {result?.errors?.["Last Name"] ? (
            <p className="text-sm text-left text-red-500">
              {result.errors["Last Name"]}
            </p>
          ) : null}
        </div>
        <div>
          <label
            className="block text-sm text-zinc-800 font-medium mb-2"
            htmlFor="Email"
          >
            Email
          </label>
          <Input
            id="Email"
            name="Email"
            defaultValue={result?.values?.Email ?? ""}
            type="email"
            disabled={isPending}
            placeholder="john@acmecorp.com"
          />
          {result?.errors?.Email ? (
            <p className="text-sm text-left text-red-500">
              {result.errors.Email}
            </p>
          ) : null}
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            htmlFor="Description"
          >
            Project Details
          </label>
          <Textarea
            id="Description"
            name="Description"
            rows={4}
            disabled={isPending}
            defaultValue={result?.values?.Description ?? ""}
            placeholder="Share your requirements"
          />
          {result?.errors?.Description ? (
            <p className="text-sm text-left text-red-500">
              {result.errors.Description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 text-center">
        <Button aria-disabled={isPending} type="submit">
          {isPending ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : null}
          {result?.success === true ? (
            <CheckCircle2 className="mr-2 size-4" />
          ) : null}
          {result?.success === false && result.message ? (
            <XCircle className="mr-2 size-4" />
          ) : null}
          {result?.message ?? "Request early access"}
        </Button>
      </div>
    </form>
  );
}
