import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Copy,
  Edit,
  MoreHorizontal,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { Button } from "@propsto/ui/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@propsto/ui/atoms/dropdown-menu";
import type { FeedbackTemplateWithFields } from "@propsto/data/repos/feedback-template";

interface TemplateListProps {
  templates: FeedbackTemplateWithFields[];
  showActions?: boolean;
  showDuplicate?: boolean;
}

const feedbackTypeBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  RECOGNITION: "default",
  THREE_SIXTY: "secondary",
  PEER_REVIEW: "secondary",
  MANAGER_FEEDBACK: "outline",
  REPORT_FEEDBACK: "outline",
  SELF_ASSESSMENT: "outline",
  ANONYMOUS: "secondary",
};

const feedbackTypeLabel: Record<string, string> = {
  RECOGNITION: "Recognition",
  THREE_SIXTY: "360°",
  PEER_REVIEW: "Peer Review",
  MANAGER_FEEDBACK: "Manager",
  REPORT_FEEDBACK: "Report",
  SELF_ASSESSMENT: "Self",
  ANONYMOUS: "Anonymous",
};

export function TemplateList({
  templates,
  showActions = false,
  showDuplicate = false,
}: TemplateListProps): React.JSX.Element {
  if (templates.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No templates to display
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          showActions={showActions}
          showDuplicate={showDuplicate}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  showActions,
  showDuplicate,
}: {
  template: FeedbackTemplateWithFields;
  showActions: boolean;
  showDuplicate: boolean;
}): React.JSX.Element {
  const fieldCount = template.fields.length;
  const usageCount = template._count.feedbacks + template._count.links;

  return (
    <Card className="group relative transition-colors hover:bg-muted/50">
      <Link
        href={`/templates/${template.id}`}
        className="absolute inset-0 z-10"
      >
        <span className="sr-only">View template</span>
      </Link>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-medium line-clamp-1">
                {template.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {formatDistanceToNow(new Date(template.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>
          </div>
          {(showActions || showDuplicate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-20 size-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showActions && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/templates/${template.id}/edit`}
                        className="relative z-20"
                      >
                        <Edit className="mr-2 size-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="relative z-20">
                      <Copy className="mr-2 size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="relative z-20 text-destructive">
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {showDuplicate && !showActions && (
                  <DropdownMenuItem className="relative z-20">
                    <Copy className="mr-2 size-4" />
                    Use as Template
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                feedbackTypeBadgeVariant[template.feedbackType] || "secondary"
              }
            >
              {feedbackTypeLabel[template.feedbackType] ||
                template.feedbackType}
            </Badge>
            {template.isPublic ? (
              <Badge variant="outline" className="text-xs">
                <Globe className="mr-1 size-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Lock className="mr-1 size-3" />
                Private
              </Badge>
            )}
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {fieldCount} {fieldCount === 1 ? "field" : "fields"}
            </span>
            <span>
              {usageCount} {usageCount === 1 ? "use" : "uses"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
