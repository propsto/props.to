"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
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
import { toast } from "@propsto/ui/atoms/sonner";
import { Copy, MessageSquare, Plus, Trash2 } from "lucide-react";
import { EntityDialog, type EntityFormData } from "./entity-dialog";
import { createEntityLinkAction, deleteEntityAction } from "./actions";

export type EntityRow = EntityFormData & {
  feedbackCount: number;
  links: { id: string; name: string; slug: string; template: string }[];
};

interface EntityListProps {
  orgSlug: string;
  entities: EntityRow[];
  templates: { id: string; name: string }[];
}

export function EntityList({
  orgSlug,
  entities,
  templates,
}: EntityListProps): React.ReactNode {
  const [confirmDelete, setConfirmDelete] = useState<EntityRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (): void => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const result = await deleteEntityAction(orgSlug, confirmDelete.id);
      if (result.success) setConfirmDelete(null);
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      {entities.map(entity => (
        <Card key={entity.id} data-testid="entity">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{entity.name}</CardTitle>
              <CardDescription>
                /{orgSlug}/{entity.slug}
                {entity.description ? ` · ${entity.description}` : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button asChild variant="outline" size="sm">
                <Link href={`/org/${orgSlug}/admin/entities/${entity.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback ({entity.feedbackCount})
                </Link>
              </Button>
              <EntityDialog orgSlug={orgSlug} entity={entity} />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${entity.name}`}
                onClick={() => setConfirmDelete(entity)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {entity.links.map(link => {
              const path = `/${orgSlug}/${entity.slug}/${link.slug}`;
              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{link.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {path} · {link.template}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        new URL(path, window.location.origin).href,
                      );
                      toast.success("Link copied");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              );
            })}
            <NewLinkDialog
              orgSlug={orgSlug}
              entityId={entity.id}
              templates={templates}
            />
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={!!confirmDelete}
        onOpenChange={open => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entity</DialogTitle>
            <DialogDescription>
              Delete &quot;{confirmDelete?.name}&quot;? Its links stop working
              and its feedback is deleted with it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
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
    </div>
  );
}

function NewLinkDialog({
  orgSlug,
  entityId,
  templates,
}: {
  orgSlug: string;
  entityId: string;
  templates: { id: string; name: string }[];
}): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required");
    if (!templateId) return setError("Please select a template");
    startTransition(async () => {
      const result = await createEntityLinkAction(orgSlug, entityId, {
        name,
        slug: slug || undefined,
        templateId,
      });
      if (result.success) {
        setOpen(false);
        setName("");
        setSlug("");
        setTemplateId("");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Link</DialogTitle>
            <DialogDescription>
              Anyone with the link can give feedback. Feedback from non-members
              waits in moderation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-name">Link Name</Label>
              <Input
                id="link-name"
                placeholder="e.g., Website feedback"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-slug">
                Slug <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="link-slug"
                placeholder="e.g., feedback"
                value={slug}
                onChange={e =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-template">Template</Label>
              <Select
                value={templateId}
                onValueChange={setTemplateId}
                disabled={isPending}
              >
                <SelectTrigger id="link-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
