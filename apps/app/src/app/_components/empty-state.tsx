import NextLink from "next/link";
import { MessageSquare, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon = MessageSquare,
}: EmptyStateProps): React.JSX.Element {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {actionLabel && actionHref && (
        <CardContent className="flex justify-center pb-6">
          <Button asChild>
            <NextLink href={actionHref}>
              {actionLabel}
              <ArrowRight className="ml-2 size-4" />
            </NextLink>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export function NoFeedbackState(): React.JSX.Element {
  return (
    <EmptyState
      title="No feedback yet"
      description="Create a feedback link and share it to start receiving feedback."
      actionLabel="Create a Link"
      actionHref="/links/new"
      icon={MessageSquare}
    />
  );
}

export function NoLinksState(): React.JSX.Element {
  return (
    <EmptyState
      title="No feedback links"
      description="Feedback links let you receive feedback from anyone. Create one to get started."
      actionLabel="Create a Link"
      actionHref="/links/new"
      icon={LinkIcon}
    />
  );
}

export function NoTemplatesState(): React.JSX.Element {
  return (
    <EmptyState
      title="No templates yet"
      description="Templates define the questions asked when collecting feedback. Create a custom template or use a public one."
      actionLabel="Create Template"
      actionHref="/templates/new"
      icon={MessageSquare}
    />
  );
}
