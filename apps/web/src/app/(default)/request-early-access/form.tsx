"use client";

import { Button, Input, Textarea } from "@propsto/ui/atoms";
import { LoaderCircle, CheckCircle2, XCircle } from "lucide-react";
import { useResetableActionState } from "@propsto/ui/hooks/use-resetable-action-state";
import { requestEarlyAccess } from "./action";

export function Form(): JSX.Element {
  const [result, action, isPending] = useResetableActionState(
    requestEarlyAccess,
    undefined,
  );

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
          <Input
            id="First_Name"
            name="First Name"
            type="text"
            placeholder="John"
            disabled={isPending}
          />
          {result?.errors?.firstName ? (
            <p className="text-sm text-left text-red-500">
              {result.errors.firstName}
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
            disabled={isPending}
            placeholder="Williams"
          />
          {result?.errors?.lastName ? (
            <p className="text-sm text-left text-red-500">
              {result.errors.lastName}
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
            name="email"
            type="email"
            disabled={isPending}
            placeholder="john@acmecorp.com"
          />
          {result?.errors?.email ? (
            <p className="text-sm text-left text-red-500">
              {result.errors.email}
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
            placeholder="Share your requirements"
          />
          {result?.errors?.projectDetails ? (
            <p className="text-sm text-left text-red-500">
              {result.errors.projectDetails}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-5">
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
