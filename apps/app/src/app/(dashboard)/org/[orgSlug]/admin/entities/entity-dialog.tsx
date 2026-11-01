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
import { createEntityAction, updateEntityAction } from "./actions";

export type EntityFormData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

interface EntityDialogProps {
  orgSlug: string;
  // Edit this entity; without it the dialog creates a new one
  entity?: EntityFormData;
}

type FormValues = { name: string; slug: string; description: string };

const toSlug = (v: string): string =>
  v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export function EntityDialog({
  orgSlug,
  entity,
}: EntityDialogProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: entity?.name ?? "",
      slug: entity?.slug ?? "",
      description: entity?.description ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = entity
        ? await updateEntityAction(orgSlug, entity.id, values)
        : await createEntityAction(orgSlug, values);
      if (result.success) {
        if (!entity) form.reset();
        setOpen(false);
      } else {
        form.setError("root", { message: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {entity ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${entity.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Entity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entity ? "Edit Entity" : "Create Entity"}</DialogTitle>
          <DialogDescription>
            {entity
              ? "Changing the slug changes the public URL of every link."
              : "A product, event or service your organization collects feedback on."}
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
              rules={{ validate: v => v.trim() !== "" || "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Acme Website"
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        // Suggest a slug from the name until one is typed
                        if (!entity && !form.formState.dirtyFields.slug) {
                          form.setValue("slug", toSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., website"
                      {...field}
                      onChange={e => field.onChange(toSlug(e.target.value))}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Shown on the public feedback page"
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
                  : entity
                    ? "Save Changes"
                    : "Create Entity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
