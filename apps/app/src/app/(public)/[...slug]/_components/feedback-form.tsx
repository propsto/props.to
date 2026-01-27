"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
import { Textarea } from "@propsto/ui/atoms/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Label } from "@propsto/ui/atoms/label";
import { Switch } from "@propsto/ui/atoms/switch";
import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";
import { submitFeedbackAction } from "../actions";

interface FeedbackSubmissionFormProps {
  link: FeedbackLinkWithRelations;
  basePath: string;
}

export function FeedbackSubmissionForm({
  link,
  basePath,
}: FeedbackSubmissionFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAnonymous, setIsAnonymous] = useState(
    link.visibility === "ANONYMOUS",
  );
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(null);

    if (!feedback.trim()) {
      setError("Please provide your feedback");
      return;
    }

    startTransition(async () => {
      const result = await submitFeedbackAction({
        linkId: link.id,
        submitterName: isAnonymous ? undefined : submitterName || undefined,
        submitterEmail: isAnonymous ? undefined : submitterEmail || undefined,
        isAnonymous,
        fieldsData: {
          feedback,
          rating,
        },
      });
      if (result.success) {
        router.push(`${basePath}/thanks`);
      } else {
        setError(result.error ?? "Failed to submit feedback");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Your feedback helps people grow and improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous toggle */}
          {link.visibility !== "ANONYMOUS" && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Submit anonymously</Label>
                <p className="text-sm text-muted-foreground">
                  Your identity will be hidden from the recipient
                </p>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          )}

          {/* Submitter info (if not anonymous) */}
          {!isAnonymous && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submitterName">Your Name (optional)</Label>
                <Input
                  id="submitterName"
                  placeholder="John Doe"
                  value={submitterName}
                  onChange={e => setSubmitterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Your Email (optional)</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={submitterEmail}
                  onChange={e => setSubmitterEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Feedback fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts..."
                className="min-h-[150px]"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Be specific and constructive
              </p>
            </div>

            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                      rating === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                1 = Needs Improvement, 5 = Excellent
              </p>
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
