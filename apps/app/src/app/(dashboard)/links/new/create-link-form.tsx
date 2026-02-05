"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Building2, CheckCircle2, Loader2, User, XCircle } from "lucide-react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@propsto/ui/atoms/select";
import { Switch } from "@propsto/ui/atoms/switch";
import { FeedbackType, FeedbackVisibility } from "@prisma/client";
import type { FeedbackTemplateWithFields } from "@propsto/data/repos/feedback-template";
import { createLinkAction, checkSlugAvailableAction } from "./actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "URL slug is required")
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Only lowercase letters, numbers, and hyphens allowed",
    ),
  templateId: z.string().min(1, "Please select a template"),
  feedbackType: z.nativeEnum(FeedbackType),
  visibility: z.nativeEnum(FeedbackVisibility),
  maxResponses: z.coerce.number().min(0).optional(),
  isHidden: z.boolean(),
  organizationId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Organization = {
  id: string;
  name: string;
  slug: string;
};

interface CreateLinkFormProps {
  templates: FeedbackTemplateWithFields[];
  organizations?: Organization[];
  orgTemplatesMap?: Record<
    string,
    { orgName: string; templates: FeedbackTemplateWithFields[] }
  >;
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
  organizations = [],
  orgTemplatesMap = {},
}: CreateLinkFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [selectedAccount, setSelectedAccount] = useState<string>("personal");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      templateId: "",
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      maxResponses: undefined,
      isHidden: false,
      organizationId: undefined,
    },
  });

  const slugValue = useWatch({ control: form.control, name: "slug" });

  // When account changes, update organizationId and reset template
  function handleAccountChange(value: string): void {
    setSelectedAccount(value);
    form.setValue("organizationId", value === "personal" ? undefined : value);
    form.setValue("templateId", "");
  }

  // Filter templates based on selected account
  const filteredTemplates = React.useMemo(() => {
    const defaultTpls = templates.filter(t => t.isDefault);

    if (selectedAccount === "personal") {
      const userTpls = templates.filter(
        t =>
          !t.isDefault &&
          t.organizations?.length === 0 &&
          (t.users?.length ?? 0) > 0,
      );
      return [...userTpls, ...defaultTpls];
    }

    // Org selected — show org templates + defaults
    const orgData = orgTemplatesMap[selectedAccount];
    const orgTpls = orgData?.templates ?? [];
    return [
      ...orgTpls,
      ...defaultTpls.filter(t => !orgTpls.some(ot => ot.id === t.id)),
    ];
  }, [selectedAccount, templates, orgTemplatesMap]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slugValue || slugValue.length < 2) {
      setSlugStatus("idle");
      return;
    }

    // Validate format first
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    const timeout = setTimeout(async () => {
      const result = await checkSlugAvailableAction(slugValue);
      setSlugStatus(result.available ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timeout);
  }, [slugValue]);

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

  // Group filtered templates by source
  const userTemplates = filteredTemplates.filter(
    t =>
      !t.isDefault &&
      t.organizations?.length === 0 &&
      (t.users?.length ?? 0) > 0,
  );
  const orgTemplates = filteredTemplates.filter(
    t => !t.isDefault && (t.organizations?.length ?? 0) > 0,
  );
  const defaultTemplates = filteredTemplates.filter(t => t.isDefault);

  const selectedOrgName =
    selectedAccount !== "personal"
      ? organizations.find(o => o.id === selectedAccount)?.name
      : undefined;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Link Details</CardTitle>
        <CardDescription>Configure your feedback link settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Account selector — only show if user has orgs */}
            {organizations.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Create for</FormLabel>
                <Select
                  value={selectedAccount}
                  onValueChange={handleAccountChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Personal</span>
                      </div>
                    </SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{org.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[0.8rem] text-muted-foreground">
                  {selectedAccount === "personal"
                    ? "This link will belong to your personal account"
                    : `This link will belong to ${selectedOrgName}`}
                </p>
              </div>
            )}

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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="e.g., leadership-q1"
                        {...field}
                        onChange={e => {
                          // Auto-format: lowercase, replace spaces with hyphens
                          const formatted = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "");
                          field.onChange(formatted);
                        }}
                        className="pr-10"
                      />
                    </FormControl>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugStatus === "checking" && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {slugStatus === "available" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {slugStatus === "taken" && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <FormDescription>
                    Your link URL will be: props.to/you/{field.value || "slug"}
                    {slugStatus === "taken" && (
                      <span className="ml-2 text-red-500">
                        — already in use
                      </span>
                    )}
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
                        <>
                          {userTemplates.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>My Templates</SelectLabel>
                              {userTemplates.map(template => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {orgTemplates.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>
                                {selectedOrgName ?? "Organization"} Templates
                              </SelectLabel>
                              {orgTemplates.map(template => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {defaultTemplates.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Default Templates</SelectLabel>
                              {defaultTemplates.map(template => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </>
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
              <Button
                type="submit"
                disabled={
                  isPending ||
                  slugStatus === "taken" ||
                  slugStatus === "checking"
                }
              >
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
