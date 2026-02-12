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
import { Textarea } from "@propsto/ui/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@propsto/ui/atoms/select";
import { Plus } from "lucide-react";
import { createGroupAction } from "./actions";
import { toast } from "@propsto/ui/atoms/sonner";
import type { ProfileVisibility } from "@prisma/client";

interface MemberOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  image: string | null;
}

interface CreateGroupDialogProps {
  organizationId: string;
  members: MemberOption[];
}

export function CreateGroupDialog({
  organizationId,
}: CreateGroupDialogProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProfileVisibility>("ORGANIZATION");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    startTransition(async () => {
      const result = await createGroupAction({
        name: name.trim(),
        organizationId,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        visibility,
      });

      if (result.success) {
        toast.success(`"${name}" has been created.`);
        setOpen(false);
        setName("");
        setSlug("");
        setDescription("");
        setVisibility("ORGANIZATION");
      } else {
        toast.error(result.error ?? "Failed to create group");
      }
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize members and feedback
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g., Marketing Team"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">@</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="marketing-team"
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be used in the group&apos;s public URL
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional description for the group page"
                disabled={isPending}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={v => setVisibility(v as ProfileVisibility)}
                disabled={isPending}
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORGANIZATION">
                    Organization Only
                  </SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Who can view this group&apos;s page
              </p>
            </div>
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
              {isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
