"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
import { Label } from "@propsto/ui/atoms/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { AlertCircle, Check, Loader2, ExternalLink } from "lucide-react";
import { checkSlugAvailability, updateOrgSlug } from "./slug-actions";

interface OrgSlugFormProps {
  currentSlug: string;
  orgName: string;
  isOwner: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function OrgSlugForm({ currentSlug, orgName, isOwner }: OrgSlugFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState(currentSlug);
  const [availability, setAvailability] = useState<{
    available: boolean;
    error?: string;
    checking: boolean;
  }>({ available: true, checking: false });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const debouncedSlug = useDebounce(slug.toLowerCase(), 500);

  const hasChanges = slug.toLowerCase() !== currentSlug;

  // Check slug availability when it changes
  const checkAvailability = useCallback(async (slugToCheck: string) => {
    if (slugToCheck === currentSlug) {
      setAvailability({ available: true, checking: false });
      return;
    }

    setAvailability((prev) => ({ ...prev, checking: true }));

    const result = await checkSlugAvailability(slugToCheck);
    setAvailability({
      available: result.available,
      error: result.error,
      checking: false,
    });
  }, [currentSlug]);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug !== currentSlug) {
      void checkAvailability(debouncedSlug);
    } else {
      setAvailability({ available: true, checking: false });
    }
  }, [debouncedSlug, currentSlug, checkAvailability]);

  const handleSave = () => {
    if (!hasChanges || !availability.available) return;

    setSaveError(null);
    setSaveSuccess(false);

    startTransition(async () => {
      const result = await updateOrgSlug(currentSlug, slug.toLowerCase());
      
      if (result.success && result.newSlug) {
        setSaveSuccess(true);
        // Redirect to new URL after brief success message
        setTimeout(() => {
          router.push(`/org/${result.newSlug}/admin/settings`);
        }, 1500);
      } else {
        setSaveError(result.error ?? "Failed to update URL");
      }
    });
  };

  const handleSlugChange = (value: string) => {
    // Only allow valid characters as user types
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(sanitized);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const previewUrl = `props.to/${slug || currentSlug}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization URL</CardTitle>
        <CardDescription>
          Your public organization URL for member profiles and feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgSlug">URL Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">props.to/</span>
            <Input
              id="orgSlug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={!isOwner || isPending}
              placeholder="your-org"
              className="max-w-[200px]"
            />
            {availability.checking && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!availability.checking && hasChanges && availability.available && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {!availability.checking && hasChanges && !availability.available && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
          {!isOwner && (
            <p className="text-sm text-muted-foreground">
              Only organization owners can change the URL
            </p>
          )}
          {availability.error && hasChanges && (
            <p className="text-sm text-destructive">{availability.error}</p>
          )}
        </div>

        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Preview</p>
              <p className="text-sm text-muted-foreground">{previewUrl}</p>
            </div>
            <a
              href={`https://${previewUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {saveError && (
          <p className="text-sm text-destructive">{saveError}</p>
        )}

        {saveSuccess && (
          <p className="text-sm text-green-500">
            URL updated! Redirecting to new URL...
          </p>
        )}

        {isOwner && (
          <Button
            onClick={handleSave}
            disabled={
              !hasChanges ||
              !availability.available ||
              availability.checking ||
              isPending
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save URL"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
