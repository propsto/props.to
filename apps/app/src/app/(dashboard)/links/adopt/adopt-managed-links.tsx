"use client";

import { useState, useEffect } from "react";
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
} from "@propsto/ui/atoms/dialog";
import { Input } from "@propsto/ui/atoms/input";
import { Label } from "@propsto/ui/atoms/label";
import { Badge } from "@propsto/ui/atoms/badge";
import { Building2, Link2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@propsto/ui/atoms/sonner";
import {
  getAvailableManagedLinksForUser,
  adoptManagedLinkAction,
} from "./actions";

// Infer types from the server action return type
type ActionResult = Awaited<ReturnType<typeof getAvailableManagedLinksForUser>>;
type OrgManagedLinks = Extract<ActionResult, { success: true }>["data"][number];
type ManagedLink = OrgManagedLinks["available"][number];

export function AdoptManagedLinks(): React.ReactNode {
  const [loading, setLoading] = useState(true);
  const [orgLinks, setOrgLinks] = useState<OrgManagedLinks[]>([]);
  const [selectedLink, setSelectedLink] = useState<ManagedLink | null>(null);
  const [customSlug, setCustomSlug] = useState("");
  const [adopting, setAdopting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      const result = await getAvailableManagedLinksForUser();
      if (result.success && result.data) {
        setOrgLinks(result.data);
      }
      setLoading(false);
    }
    void fetchLinks();
  }, []);

  const handleAdopt = async () => {
    if (!selectedLink) return;

    setAdopting(true);
    const result = await adoptManagedLinkAction(
      selectedLink.id,
      customSlug || undefined,
    );

    if (result.success) {
      toast.success("Link adopted successfully!");
      setDialogOpen(false);
      setSelectedLink(null);
      setCustomSlug("");
      // Refresh the list
      const refreshResult = await getAvailableManagedLinksForUser();
      if (refreshResult.success && refreshResult.data) {
        setOrgLinks(refreshResult.data);
      }
    } else {
      toast.error(result.error || "Failed to adopt link");
    }
    setAdopting(false);
  };

  const openAdoptDialog = (link: ManagedLink) => {
    setSelectedLink(link);
    setCustomSlug("");
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orgLinks.length === 0) {
    return null;
  }

  const totalAvailable = orgLinks.reduce(
    (sum, org) => sum + org.available.length,
    0,
  );

  if (totalAvailable === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-5" />
            <CardTitle>Organization Links</CardTitle>
          </div>
          <CardDescription>
            Adopt feedback links created by your organization to use with your
            profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orgLinks.map(org => (
            <div key={org.orgId} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {org.orgName}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {org.available.map(link => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link2 className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">
                          {link.name}
                        </span>
                      </div>
                      {link.template && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {link.template.name}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAdoptDialog(link)}
                    >
                      Adopt
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adopt Feedback Link</DialogTitle>
            <DialogDescription>
              Create your own copy of &quot;{selectedLink?.name}&quot; to share
              with your contacts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customSlug">Custom URL (optional)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  props.to/f/
                </span>
                <Input
                  id="customSlug"
                  placeholder="your-custom-slug"
                  value={customSlug}
                  onChange={e =>
                    setCustomSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to generate a random slug
              </p>
            </div>

            {selectedLink?.template && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <span className="text-sm">
                    Uses template: {selectedLink.template.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={adopting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdopt} disabled={adopting}>
              {adopting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Adopting...
                </>
              ) : (
                "Adopt Link"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
