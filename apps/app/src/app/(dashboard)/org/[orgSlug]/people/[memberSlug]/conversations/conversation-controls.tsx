"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ConversationStage } from "@prisma/client";
import { Button } from "@propsto/ui/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@propsto/ui/atoms/dialog";
import { Input } from "@propsto/ui/atoms/input";
import { Label } from "@propsto/ui/atoms/label";
import { Textarea } from "@propsto/ui/atoms/textarea";
import { toast } from "@propsto/ui/atoms/sonner";
import { STAGE_LABELS } from "@/lib/conversation-labels";
import {
  addStepAction,
  attachEvidenceAction,
  openConversationAction,
  resolveConversationAction,
  type StepPayload,
} from "./actions";

type Ctx = { orgSlug: string; memberSlug: string };
type ActionResult = { success: boolean; error?: string };

const selectClass = "h-9 w-full rounded-md border bg-transparent px-2 text-sm";

function readStep(form: HTMLFormElement): StepPayload {
  const data = new FormData(form);
  const text = (key: string): string => String(data.get(key) ?? "");
  return {
    stage: text("stage"),
    sharedNote: text("sharedNote"),
    internalNote: text("internalNote"),
    reviewAt: text("reviewAt"),
    consequence: text("consequence"),
  };
}

// Runs an action, refreshes the page data on success, toasts either way
function useAction(onSuccess?: () => void) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, okMessage: string): void =>
    start(async () => {
      const result = await fn();
      if (result.success) {
        toast.success(okMessage);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  return { pending, run };
}

function StepFields({
  stages,
  idPrefix,
}: {
  stages: ConversationStage[];
  idPrefix: string;
}): React.ReactElement {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-stage`}>Stage</Label>
        <select
          id={`${idPrefix}-stage`}
          name="stage"
          className={selectClass}
          defaultValue={stages[0]}
        >
          {stages.map(stage => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-shared`}>What the member hears</Label>
        <Textarea
          id={`${idPrefix}-shared`}
          name="sharedNote"
          required
          placeholder="The fact with its date, its impact, and the change expected"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-internal`}>Internal note</Label>
        <Textarea
          id={`${idPrefix}-internal`}
          name="internalNote"
          placeholder="Only leads and admins see this"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-review`}>Review date</Label>
        <Input id={`${idPrefix}-review`} type="date" name="reviewAt" />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-consequence`}>If nothing changes</Label>
        <Textarea
          id={`${idPrefix}-consequence`}
          name="consequence"
          placeholder="What happens if there is no change"
        />
      </div>
    </>
  );
}

export function OpenConversationDialog({
  orgSlug,
  memberSlug,
  values,
  stages,
}: Ctx & {
  values: { id: string; name: string }[];
  stages: ConversationStage[];
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open conversation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open a conversation</DialogTitle>
          <DialogDescription>
            Record the first step. The member reads everything except the
            internal note.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            const valueId =
              String(new FormData(form).get("valueId") ?? "") || null;
            const step = readStep(form);
            run(
              () =>
                openConversationAction(orgSlug, memberSlug, { valueId, step }),
              "Conversation opened",
            );
          }}
        >
          {values.length > 0 ? (
            <div className="space-y-1">
              <Label htmlFor="open-value">Value</Label>
              <select
                id="open-value"
                name="valueId"
                className={selectClass}
                defaultValue=""
              >
                <option value="">No value</option>
                {values.map(value => (
                  <option key={value.id} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <StepFields stages={stages} idPrefix="open" />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Open
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddStepDialog({
  orgSlug,
  memberSlug,
  conversationId,
  stages,
}: Ctx & {
  conversationId: string;
  stages: ConversationStage[];
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add step</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a step</DialogTitle>
          <DialogDescription>
            Stages only move forward. From the second step on, the
            organization&apos;s admins are notified.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            const step = readStep(e.currentTarget);
            run(
              () => addStepAction(orgSlug, memberSlug, conversationId, step),
              "Step added",
            );
          }}
        >
          <StepFields stages={stages} idPrefix={`step-${conversationId}`} />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AttachEvidenceForm({
  orgSlug,
  memberSlug,
  conversationId,
  options,
}: Ctx & {
  conversationId: string;
  options: { id: string; label: string }[];
}): React.ReactElement {
  const { pending, run } = useAction();
  const selectId = `evidence-${conversationId}`;

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={e => {
        e.preventDefault();
        const feedbackId = String(
          new FormData(e.currentTarget).get("feedbackId") ?? "",
        );
        if (!feedbackId) return;
        run(
          () =>
            attachEvidenceAction(
              orgSlug,
              memberSlug,
              conversationId,
              feedbackId,
            ),
          "Evidence attached",
        );
      }}
    >
      <Label htmlFor={selectId} className="sr-only">
        Evidence
      </Label>
      <select id={selectId} name="feedbackId" className={selectClass}>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" disabled={pending}>
        Attach
      </Button>
    </form>
  );
}

export function ResolveButton({
  orgSlug,
  memberSlug,
  conversationId,
}: Ctx & { conversationId: string }): React.ReactElement {
  const { pending, run } = useAction();
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        run(
          () => resolveConversationAction(orgSlug, memberSlug, conversationId),
          "Conversation resolved",
        )
      }
    >
      Resolve
    </Button>
  );
}
