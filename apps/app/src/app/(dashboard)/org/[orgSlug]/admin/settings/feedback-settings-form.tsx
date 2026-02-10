"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@propsto/ui/atoms/form";
import { Switch } from "@propsto/ui/atoms/switch";
import { Button } from "@propsto/ui/atoms/button";
import { updateFeedbackSettingsAction } from "./actions";

const formSchema = z.object({
  allowAnonymousFeedback: z.boolean(),
  enableFeedbackModeration: z.boolean(),
  autoApproveInternalFeedback: z.boolean(),
  allowMemberFormCreation: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface FeedbackSettingsFormProps {
  orgSlug: string;
  defaultSettings: {
    allowAnonymousFeedback: boolean;
    enableFeedbackModeration: boolean;
    autoApproveInternalFeedback: boolean;
    allowMemberFormCreation: boolean;
  };
}

export function FeedbackSettingsForm({
  orgSlug,
  defaultSettings,
}: FeedbackSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultSettings,
  });

  function onSubmit(values: FormValues): void {
    startTransition(async () => {
      const result = await updateFeedbackSettingsAction(orgSlug, values);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Settings</CardTitle>
        <CardDescription>
          Configure how feedback works in your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="allowMemberFormCreation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Allow Member Form Creation
                    </FormLabel>
                    <FormDescription>
                      When disabled, members can only use organization-provided
                      templates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowAnonymousFeedback"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Anonymous Feedback
                    </FormLabel>
                    <FormDescription>
                      Allow members to submit feedback anonymously
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableFeedbackModeration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Feedback Moderation
                    </FormLabel>
                    <FormDescription>
                      Review feedback before it becomes visible to recipients
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoApproveInternalFeedback"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Auto-Approve Internal Feedback
                    </FormLabel>
                    <FormDescription>
                      Automatically approve feedback from organization members
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
