"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
import { Textarea } from "@propsto/ui/atoms/text-area";
import { Switch } from "@propsto/ui/atoms/switch";
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
import { FeedbackType, FieldType } from "@prisma/client";
import { Plus, Trash2, Sparkles, GripVertical } from "lucide-react";
import { generateFormAction, createTemplateAction } from "./actions";

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
  isPublic: z.boolean(),
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

export function CreateTemplateForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      feedbackType: "RECOGNITION",
      isPublic: false,
      fields: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  function addField(): void {
    append({
      label: "",
      type: "TEXT",
      required: false,
      order: fields.length,
    });
  }

  async function handleGenerate(): Promise<void> {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiError(null);

    const result = await generateFormAction({ prompt: aiPrompt });

    if (result.success && result.form) {
      form.setValue("name", result.form.name);
      if (result.form.description) {
        form.setValue("description", result.form.description);
      }
      replace(
        result.form.fields.map((f, i) => ({
          label: f.label,
          type: f.type as FieldType,
          required: f.required ?? false,
          options: f.options,
          placeholder: f.placeholder,
          helpText: f.helpText,
          order: i,
        })),
      );
      setAiPrompt("");
    } else {
      setAiError(result.error ?? "Failed to generate form");
    }

    setIsGenerating(false);
  }

  function onSubmit(values: FormValues): void {
    startTransition(async () => {
      const result = await createTemplateAction({
        ...values,
        fields: values.fields.map((f, i) => ({
          ...f,
          order: i,
        })),
      });

      if (result.success) {
        router.push("/templates");
      } else {
        form.setError("root", {
          message: result.error ?? "Failed to create template",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* AI Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Form Generator
          </CardTitle>
          <CardDescription>
            Describe the feedback form you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g., Create a feedback form with a 5-star rating for overall satisfaction and a comment field for suggestions"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Form
                </>
              )}
            </Button>
            {aiError && (
              <span className="text-sm text-destructive">{aiError}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Form */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Configure your template settings and fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Quarterly Feedback Form"
                        {...field}
                      />
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
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this template is for"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
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
                            <SelectValue placeholder="Select type" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Public Template</FormLabel>
                        <FormDescription className="text-xs">
                          Allow others to use this template
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
              </div>

              {/* Fields Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Fields</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addField}
                  >
                    <Plus className="mr-2 size-4" />
                    Add Field
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    No fields yet. Use AI to generate or add fields manually.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <FieldEditor
                        key={field.id}
                        index={index}
                        control={form.control}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>
                )}

                {form.formState.errors.fields?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.fields.root.message}
                  </p>
                )}
              </div>

              {form.formState.errors.root && (
                <div className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Template"}
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
    </div>
  );
}

interface FieldEditorProps {
  index: number;
  control: any;
  onRemove: () => void;
}

function FieldEditor({
  index,
  control,
  onRemove,
}: FieldEditorProps): React.JSX.Element {
  return (
    <Card className="relative">
      <CardContent className="pt-4">
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 pr-10">
          <div className="flex items-center gap-2">
            <GripVertical className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Field {index + 1}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name={`fields.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Question text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`fields.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldTypeOptions.map(option => (
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name={`fields.${index}.placeholder`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Placeholder (optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Hint text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`fields.${index}.required`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-6">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-normal">
                    Required field
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
