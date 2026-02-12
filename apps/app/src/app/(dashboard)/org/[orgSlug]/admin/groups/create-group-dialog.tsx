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
import { Plus } from "lucide-react";
import { createGroupAction } from "./actions";
import { toast } from "@propsto/ui/atoms/sonner";

interface MemberOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  image: string | null;
}

interface GroupOption {
  id: string;
  name: string;
  parentGroupId: string | null;
}

interface CreateGroupDialogProps {
  organizationId: string;
  members: MemberOption[];
  groups: GroupOption[];
}

export function CreateGroupDialog({
  organizationId,
  groups,
}: CreateGroupDialogProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentGroupId, setParentGroupId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  // Filter out groups that already have a parent (can't create subgroups of subgroups)
  const topLevelGroups = groups.filter(g => !g.parentGroupId);

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
        parentGroupId,
      });

      if (result.success) {
        toast.success(`"${name}" has been created.`);
        setOpen(false);
        setName("");
        setSlug("");
        setParentGroupId(undefined);
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
            {topLevelGroups.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="parentGroup">Parent Group (optional)</Label>
                <Select
                  value={parentGroupId ?? "none"}
                  onValueChange={(value) => setParentGroupId(value === "none" ? undefined : value)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level group)</SelectItem>
                    {topLevelGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Create this as a subgroup within an existing group
                </p>
              </div>
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
              {isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
