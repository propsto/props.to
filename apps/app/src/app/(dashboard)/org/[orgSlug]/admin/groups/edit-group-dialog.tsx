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
import { updateGroupAction } from "./actions";
import { toast } from "@propsto/ui/atoms/sonner";
import type { GroupWithMembers } from "@propsto/data/repos";
import type { ProfileVisibility } from "@prisma/client";

interface EditGroupDialogProps {
  group: GroupWithMembers;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
}: EditGroupDialogProps): React.ReactNode {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(
    (group as { description?: string | null }).description ?? "",
  );
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    ((group as { visibility?: ProfileVisibility }).visibility as ProfileVisibility) ??
      "ORGANIZATION",
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    startTransition(async () => {
      const result = await updateGroupAction(group.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      });

      if (result.success) {
        toast.success(`"${name}" has been updated.`);
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Failed to update group");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group name. Slug cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Marketing Team"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">@</span>
                <span className="text-sm">{group.slug.slug}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Slugs cannot be changed after creation
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional description for the group page"
                disabled={isPending}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={v => setVisibility(v as ProfileVisibility)}
                disabled={isPending}
              >
                <SelectTrigger id="edit-visibility">
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
