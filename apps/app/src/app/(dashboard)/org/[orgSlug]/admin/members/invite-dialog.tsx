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
import { Textarea } from "@propsto/ui/atoms/textarea";
import { UserPlusIcon } from "lucide-react";
import { inviteMembersAction } from "./actions";
import type { OrganizationRole } from "@prisma/client";

interface InviteDialogProps {
  orgSlug: string;
}

export function InviteDialog({ orgSlug }: InviteDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");
  const [role, setRole] = useState<OrganizationRole>("MEMBER");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ email: string; success: boolean; error?: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    setResults([]);

    const emails = emailsInput
      .split(/[\s,;]+/)
      .map(e => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setError("Please enter at least one email address");
      return;
    }

    startTransition(async () => {
      const result = await inviteMembersAction(orgSlug, {
        emails,
        role,
        message: message.trim() || undefined,
      });

      if (result.success && result.results) {
        const failed = result.results.filter(r => !r.success);
        if (failed.length === 0) {
          setOpen(false);
          setEmailsInput("");
          setRole("MEMBER");
          setMessage("");
        } else {
          setResults(result.results);
          setError(`${failed.length} invitation(s) could not be sent`);
        }
      } else {
        setError(result.error ?? "Failed to send invitations");
      }
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmailsInput("");
      setRole("MEMBER");
      setMessage("");
      setError(null);
      setResults([]);
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Enter one or more email addresses separated by commas or newlines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-emails">Email addresses</Label>
            <Textarea
              id="invite-emails"
              placeholder="alice@example.com, bob@example.com"
              value={emailsInput}
              onChange={e => setEmailsInput(e.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={v => setRole(v as OrganizationRole)}
              disabled={isPending}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-message">
              Personal message{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="invite-message"
              placeholder="Looking forward to working with you!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isPending}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {results.length > 0 ? (
            <ul className="text-sm space-y-1">
              {results.map(r => (
                <li key={r.email} className={r.success ? "text-green-600" : "text-destructive"}>
                  {r.email}: {r.success ? "Invited" : (r.error ?? "Failed")}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Sending…" : "Send Invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
