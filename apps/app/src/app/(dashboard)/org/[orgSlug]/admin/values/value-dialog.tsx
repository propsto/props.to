"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@propsto/ui/molecules/form";
import { Input } from "@propsto/ui/atoms/input";
import { Textarea } from "@propsto/ui/atoms/textarea";
import { Pencil, Plus } from "lucide-react";
import { createValueAction, updateValueAction } from "./actions";

export type OrgValue = {
  id: string;
  name: string;
  description: string | null;
};

interface ValueDialogProps {
  orgSlug: string;
  // Edit this value; without it the dialog creates a new one
  value?: OrgValue;
}

type FormValues = {
  name: string;
  description: string;
};

export function ValueDialog({
  orgSlug,
  value,
}: ValueDialogProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: value?.name ?? "",
      description: value?.description ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const data = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      };
      const result = value
        ? await updateValueAction(orgSlug, value.id, data)
        : await createValueAction(orgSlug, data);

      if (result.success) {
        if (!value) form.reset();
        setOpen(false);
      } else {
        form.setError("root", {
          message: result.error ?? "Failed to save value",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {value ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${value.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Value
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{value ? "Edit Value" : "Create Value"}</DialogTitle>
          <DialogDescription>
            {value
              ? "Renaming keeps the value on feedback already tagged with it."
              : "Add a value people can tag feedback with."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={e => void form.handleSubmit(onSubmit)(e)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ownership" {...field} />
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
                      placeholder="What this value looks like in practice..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : value
                    ? "Save Changes"
                    : "Create Value"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
