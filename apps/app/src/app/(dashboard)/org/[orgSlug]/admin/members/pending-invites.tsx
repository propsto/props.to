"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@propsto/ui/atoms/table";
import { Badge } from "@propsto/ui/atoms/badge";
import { Button } from "@propsto/ui/atoms/button";
import { MailIcon, RefreshCwIcon, XIcon } from "lucide-react";
import { revokeInviteAction, resendInviteAction } from "./actions";

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { firstName: string | null; lastName: string | null } | null;
}

interface PendingInvitesProps {
  orgSlug: string;
  invites: PendingInvite[];
}

export function PendingInvites({ orgSlug, invites }: PendingInvitesProps): React.ReactElement | null {
  const [isPending, startTransition] = useTransition();

  if (invites.length === 0) return null;

  const handleRevoke = (inviteId: string) => {
    startTransition(async () => {
      await revokeInviteAction(orgSlug, inviteId);
    });
  };

  const handleResend = (inviteId: string) => {
    startTransition(async () => {
      await resendInviteAction(orgSlug, inviteId);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MailIcon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Pending Invitations ({invites.length})</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map(invite => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant={invite.role === "ADMIN" ? "secondary" : "outline"}>
                  {invite.role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {invite.invitedBy
                  ? `${invite.invitedBy.firstName ?? ""} ${invite.invitedBy.lastName ?? ""}`.trim() || "—"
                  : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(invite.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResend(invite.id)}
                    disabled={isPending}
                    title="Resend invitation"
                  >
                    <RefreshCwIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(invite.id)}
                    disabled={isPending}
                    title="Revoke invitation"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
