"use client";

import { useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@propsto/ui/atoms/select";
import { Plus, Loader2 } from "lucide-react";
import { createManagedLinkAction } from "./actions";
import type { FeedbackType, FeedbackVisibility } from "@prisma/client";

interface Template {
  id: string;
  name: string;
  feedbackType: FeedbackType;
}

interface CreateManagedLinkDialogProps {
  organizationId: string;
  orgSlug: string;
  templates: Template[];
  userId: string;
}

export function CreateManagedLinkDialog({
  organizationId,
  orgSlug,
  templates,
  userId,
}: CreateManagedLinkDialogProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [visibility, setVisibility] = useState<FeedbackVisibility>("ORGANIZATION");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!templateId) {
      setError("Please select a template");
      return;
    }

    startTransition(async () => {
      const result = await createManagedLinkAction({
        organizationId,
        orgSlug,
        templateId,
        name: name.trim(),
        slug: slug.trim() || undefined,
        visibility,
      });

      if (result.success) {
        setOpen(false);
        setName("");
        setSlug("");
        setTemplateId("");
        setVisibility("ORGANIZATION");
      } else {
        setError(result.error ?? "Failed to create managed link");
      }
    });
  };

  const selectedTemplate = templates.find(t => t.id === templateId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Create Managed Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Managed Link</DialogTitle>
            <DialogDescription>
              Create a link template that employees can adopt to their profiles.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Link Name</Label>
              <Input
                id="name"
                placeholder="e.g., Leadership Feedback 2026"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">
                Custom Slug{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="slug"
                placeholder="e.g., leadership-2026"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={templateId}
                onValueChange={setTemplateId}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={v => setVisibility(v as FeedbackVisibility)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="ORGANIZATION">Organization</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
