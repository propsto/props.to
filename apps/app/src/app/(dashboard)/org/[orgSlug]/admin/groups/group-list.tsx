"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@propsto/ui/atoms/table";
import { Badge } from "@propsto/ui/atoms/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Button } from "@propsto/ui/atoms/button";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@propsto/ui/atoms/dropdown-menu";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@propsto/ui/atoms/dialog";
import { EditGroupDialog } from "./edit-group-dialog";
import { ManageMembersDialog } from "./manage-members-dialog";
import { deleteGroupAction } from "./actions";
import { toast } from "@propsto/ui/atoms/sonner";
import type { GroupWithMembers } from "@propsto/data/repos";

interface MemberOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  image: string | null;
}

interface GroupListProps {
  groups: GroupWithMembers[];
  members: MemberOption[];
}

export function GroupList({
  groups,
  members,
}: GroupListProps): React.ReactNode {
  const [editingGroup, setEditingGroup] = useState<GroupWithMembers | null>(
    null,
  );
  const [managingMembersGroup, setManagingMembersGroup] =
    useState<GroupWithMembers | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<GroupWithMembers | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deletingGroup) return;

    startTransition(async () => {
      const result = await deleteGroupAction(deletingGroup.id);
      if (result.success) {
        toast.success(`"${deletingGroup.name}" has been deleted.`);
      } else {
        toast.error(result.error ?? "Failed to delete group");
      }
      setDeletingGroup(null);
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Links</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(group => (
            <TableRow key={group.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{group.name}</p>
                    {group.admins.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Admin:{" "}
                        {group.admins
                          .map(
                            a =>
                              a.user.firstName ??
                              a.user.lastName ??
                              "Unknown",
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm">@{group.slug.slug}</code>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {group.users.slice(0, 3).map(user => (
                      <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {user.firstName?.[0] ?? user.email?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {group.users.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{group.users.length - 3}
                    </Badge>
                  )}
                  {group.users.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No members
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {group._count.feedbackLinks} link
                  {group._count.feedbackLinks !== 1 ? "s" : ""}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingGroup(group)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setManagingMembersGroup(group)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingGroup(group)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingGroup && (
        <EditGroupDialog
          group={editingGroup}
          open={!!editingGroup}
          onOpenChange={(open: boolean) => !open && setEditingGroup(null)}
        />
      )}

      {managingMembersGroup && (
        <ManageMembersDialog
          group={managingMembersGroup}
          allMembers={members}
          open={!!managingMembersGroup}
          onOpenChange={(open: boolean) => !open && setManagingMembersGroup(null)}
        />
      )}

      <Dialog
        open={!!deletingGroup}
        onOpenChange={open => !open && setDeletingGroup(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete group?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{deletingGroup?.name}&quot; and remove
              all member associations. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingGroup(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
