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
import { createLevelAction, updateLevelAction } from "./actions";

export type OrgLevel = {
  id: string;
  name: string;
  summary: string | null;
};

interface LevelDialogProps {
  orgSlug: string;
  // Edit this level; without it the dialog creates a new one
  level?: OrgLevel;
}

type FormValues = {
  name: string;
  summary: string;
};

export function LevelDialog({
  orgSlug,
  level,
}: LevelDialogProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: level?.name ?? "",
      summary: level?.summary ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const data = {
        name: values.name.trim(),
        summary: values.summary.trim(),
      };
      const result = level
        ? await updateLevelAction(orgSlug, level.id, data)
        : await createLevelAction(orgSlug, data);

      if (result.success) {
        if (!level) form.reset();
        setOpen(false);
      } else {
        form.setError("root", {
          message: result.error ?? "Failed to save level",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {level ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${level.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Level
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{level ? "Edit Level" : "Create Level"}</DialogTitle>
          <DialogDescription>
            {level
              ? "Renaming keeps the level on members assigned to it."
              : "Add a level members can be assigned to."}
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
              rules={{
                validate: v => v.trim() !== "" || "Name is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is expected at this level, in a sentence..."
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
                  : level
                    ? "Save Changes"
                    : "Create Level"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
