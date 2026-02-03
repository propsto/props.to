"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
import { Textarea } from "@propsto/ui/atoms/text-area";
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
import { FeedbackType, FieldType } from "@prisma/client";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createOrgTemplateAction } from "../actions";

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.nativeEnum(FieldType),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  order: z.number(),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  feedbackType: z.nativeEnum(FeedbackType),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});

type FormValues = z.infer<typeof formSchema>;

const feedbackTypeOptions = [
  { value: "RECOGNITION", label: "Recognition / Props" },
  { value: "THREE_SIXTY", label: "360° Feedback" },
  { value: "PEER_REVIEW", label: "Peer Review" },
  { value: "MANAGER_FEEDBACK", label: "Manager Feedback" },
  { value: "REPORT_FEEDBACK", label: "Report Feedback" },
  { value: "SELF_ASSESSMENT", label: "Self Assessment" },
  { value: "ANONYMOUS", label: "Anonymous Feedback" },
];

const fieldTypeOptions = [
  { value: "TEXT", label: "Text (single line)" },
  { value: "TEXTAREA", label: "Text (multi-line)" },
  { value: "NUMBER", label: "Number" },
  { value: "RATING", label: "Rating (1-5 stars)" },
  { value: "SCALE", label: "Scale (1-10)" },
  { value: "SELECT", label: "Dropdown" },
  { value: "RADIO", label: "Radio buttons" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "DATE", label: "Date" },
];

interface CreateOrgTemplateFormProps {
  orgSlug: string;
}

export function CreateOrgTemplateForm({
  orgSlug,
}: CreateOrgTemplateFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      feedbackType: "RECOGNITION",
      fields: [
        {
          label: "Feedback",
          type: "TEXTAREA",
          required: true,
          order: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await createOrgTemplateAction({
        name: values.name,
        description: values.description,
        feedbackType: values.feedbackType,
        fields: values.fields,
        orgSlug,
      });

      if (result.success) {
        router.push(`/org/${orgSlug}/admin/templates`);
      } else {
        setError(result.error ?? "Failed to create template");
      }
    });
  };

  const addField = () => {
    append({
      label: "",
      type: "TEXT",
      required: false,
      order: fields.length,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Basic information about your template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quarterly Performance Review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this template is for..."
                      {...field}
                    />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>
                  Add fields to collect specific feedback
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No fields yet. Add at least one field.
              </p>
            ) : (
              fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`fields.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Label</FormLabel>
                              <FormControl>
                                <Input placeholder="Field label" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fields.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fieldTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`fields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Required field</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href={`/org/${orgSlug}/admin/templates`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Template
          </Button>
        </div>
      </form>
    </Form>
  );
}
