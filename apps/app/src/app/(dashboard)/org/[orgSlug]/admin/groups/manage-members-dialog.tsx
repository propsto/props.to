"use client";

import { useParams } from "next/navigation";

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
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Badge } from "@propsto/ui/atoms/badge";
import { Checkbox } from "@propsto/ui/atoms/checkbox";
import { updateGroupMembersAction } from "./actions";
import { toast } from "@propsto/ui/atoms/sonner";
import type { GroupWithMembers } from "@propsto/data/repos";

interface MemberOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  image: string | null;
}

interface ManageMembersDialogProps {
  group: GroupWithMembers;
  allMembers: MemberOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageMembersDialog({
  group,
  allMembers,
  open,
  onOpenChange,
}: ManageMembersDialogProps): React.ReactNode {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const currentMemberIds = group.users.map(u => u.id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(currentMemberIds),
  );
  const currentLeadIds = group.admins.map(a => a.userId);
  const [leadIds, setLeadIds] = useState<Set<string>>(new Set(currentLeadIds));
  const [isPending, startTransition] = useTransition();

  const handleLeadToggle = (memberId: string) => {
    const next = new Set(leadIds);
    if (next.has(memberId)) next.delete(memberId);
    else next.add(memberId);
    setLeadIds(next);
  };

  const handleToggle = (memberId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedIds(newSelected);
  };

  const handleSubmit = () => {
    const toAdd = [...selectedIds].filter(id => !currentMemberIds.includes(id));
    const toRemove = currentMemberIds.filter(id => !selectedIds.has(id));
    // Only selected members can lead; removing a member also drops their lead role
    const desiredLeads = [...leadIds].filter(id => selectedIds.has(id));
    const leadsToAdd = desiredLeads.filter(id => !currentLeadIds.includes(id));
    const leadsToRemove = currentLeadIds.filter(
      id => !desiredLeads.includes(id) && selectedIds.has(id),
    );

    if (
      toAdd.length === 0 &&
      toRemove.length === 0 &&
      leadsToAdd.length === 0 &&
      leadsToRemove.length === 0
    ) {
      onOpenChange(false);
      return;
    }

    startTransition(async () => {
      const result = await updateGroupMembersAction(orgSlug, group.id, {
        addUserIds: toAdd,
        removeUserIds: toRemove,
        addLeadIds: leadsToAdd,
        removeLeadIds: leadsToRemove,
      });

      if (result.success) {
        toast.success("Group membership has been updated.");
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Failed to update members");
      }
    });
  };

  const isLead = (id: string) => leadIds.has(id) && selectedIds.has(id);
  const changesCount =
    [...selectedIds].filter(id => !currentMemberIds.includes(id)).length +
    currentMemberIds.filter(id => !selectedIds.has(id)).length +
    [...selectedIds].filter(
      id =>
        currentMemberIds.includes(id) &&
        isLead(id) !== currentLeadIds.includes(id),
    ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Select organization members to add to &quot;{group.name}&quot;.
            Leads can open conversations with the other members of the group.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto pr-4">
          <div className="space-y-2">
            {allMembers.map(member => {
              const isSelected = selectedIds.has(member.id);
              const wasOriginalMember = currentMemberIds.includes(member.id);
              const hasChanged = isSelected !== wasOriginalMember;

              return (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(member.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.image ?? undefined} />
                    <AvatarFallback>
                      {member.firstName?.[0] ?? member.email?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                  {isSelected && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isLead(member.id) ? "default" : "outline"}
                      aria-pressed={isLead(member.id)}
                      aria-label={`Lead: ${member.firstName ?? member.email ?? ""}`}
                      onClick={e => {
                        e.preventDefault();
                        handleLeadToggle(member.id);
                      }}
                    >
                      Lead
                    </Button>
                  )}
                  {hasChanged && (
                    <Badge variant={isSelected ? "default" : "destructive"}>
                      {isSelected ? "Adding" : "Removing"}
                    </Badge>
                  )}
                </label>
              );
            })}
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
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? "Saving..."
              : changesCount > 0
                ? `Save Changes (${changesCount})`
                : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
