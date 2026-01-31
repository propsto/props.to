"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
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
  FormMessage,
} from "@propsto/ui/atoms/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@propsto/ui/atoms/select";
import { Switch } from "@propsto/ui/atoms/switch";
import { FeedbackType, FeedbackVisibility } from "@prisma/client";
import type { FeedbackTemplateWithFields } from "@propsto/data/repos/feedback-template";
import { createLinkAction } from "./actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  templateId: z.string().min(1, "Please select a template"),
  feedbackType: z.nativeEnum(FeedbackType),
  visibility: z.nativeEnum(FeedbackVisibility),
  maxResponses: z.coerce.number().min(0).optional(),
  isHidden: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLinkFormProps {
  templates: FeedbackTemplateWithFields[];
}

const feedbackTypeOptions = [
  { value: "RECOGNITION", label: "Recognition / Props" },
  { value: "THREE_SIXTY", label: "360° Feedback" },
  { value: "PEER_REVIEW", label: "Peer Review" },
  { value: "MANAGER_FEEDBACK", label: "Manager Feedback" },
  { value: "REPORT_FEEDBACK", label: "Report Feedback" },
  { value: "SELF_ASSESSMENT", label: "Self Assessment" },
  { value: "ANONYMOUS", label: "Anonymous Feedback" },
];

const visibilityOptions = [
  { value: "PUBLIC", label: "Public", description: "Anyone can see responses" },
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can see responses",
  },
  {
    value: "ORGANIZATION",
    label: "Organization",
    description: "Org members can see",
  },
  {
    value: "ANONYMOUS",
    label: "Anonymous",
    description: "Submitter identity hidden",
  },
];

export function CreateLinkForm({
  templates,
}: CreateLinkFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      templateId: "",
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      maxResponses: undefined,
      isHidden: false,
    },
  });

  function onSubmit(values: FormValues): void {
    startTransition(async () => {
      const result = await createLinkAction(values);
      if (result.success) {
        router.push("/links");
      } else {
        form.setError("root", {
          message: result.error ?? "Failed to create link",
        });
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Link Details</CardTitle>
        <CardDescription>Configure your feedback link settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Leadership Feedback Q1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A name to help you identify this link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.length === 0 ? (
                        <SelectItem value="__no_templates__" disabled>
                          No templates available
                        </SelectItem>
                      ) : (
                        templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The template defines what questions will be asked
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedbackType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of feedback being collected
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {visibilityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span>{option.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            — {option.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Who can see feedback submitted through this link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxResponses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Responses (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Unlimited"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Limit the number of responses this link can receive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isHidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Hidden Link</FormLabel>
                    <FormDescription>
                      Hidden links won&apos;t appear on your public profile but
                      can still be accessed via direct URL
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

            {form.formState.errors.root && (
              <div className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
