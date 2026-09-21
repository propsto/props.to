"use client";

import { useActionState } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { acceptInviteAction, type AcceptInviteState } from "@/server/invite-action";

export function AcceptInviteForm({ token }: { token: string }): React.ReactElement {
  const [state, action, pending] = useActionState<AcceptInviteState, FormData>(
    acceptInviteAction,
    undefined,
  );
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Joining..." : "Accept invitation"}
      </Button>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
