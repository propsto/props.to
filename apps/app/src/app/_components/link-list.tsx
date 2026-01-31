import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  Link as LinkIcon,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Edit,
  Building2,
  Users,
  Clock,
  EyeOff,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@propsto/ui/atoms/dropdown-menu";
import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";

interface LinkListProps {
  links: FeedbackLinkWithRelations[];
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

export function LinkList({ links }: LinkListProps): React.JSX.Element {
  if (links.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No links to display
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {links.map(link => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}

function LinkCard({
  link,
}: {
  link: FeedbackLinkWithRelations;
}): React.JSX.Element {
  const responseCount = link._count.feedbacks;
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const isMaxedOut =
    link.maxResponses && link.responseCount >= link.maxResponses;
  const isAvailable = link.isActive && !isExpired && !isMaxedOut;

  // Construct the public link URL
  const publicUrl = `${process.env.NEXT_PUBLIC_WEB_URL ?? "https://props.to"}/f/${link.slug}`;

  return (
    <Card className={`group relative ${!link.isActive ? "opacity-75" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${
                isAvailable ? "bg-green-500/10" : "bg-muted"
              }`}
            >
              <LinkIcon
                className={`size-5 ${isAvailable ? "text-green-500" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <CardTitle className="text-base font-medium line-clamp-1">
                {link.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {formatDistanceToNow(new Date(link.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(publicUrl)}
              >
                <Copy className="mr-2 size-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  Open Link
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/links/${link.id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {link.isActive ? (
                  <>
                    <Pause className="mr-2 size-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 size-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Link URL preview */}
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
            <code className="truncate text-muted-foreground">
              /f/{link.slug}
            </code>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {isAvailable ? (
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
            ) : isExpired ? (
              <Badge variant="destructive">Expired</Badge>
            ) : isMaxedOut ? (
              <Badge variant="secondary">Max Reached</Badge>
            ) : (
              <Badge variant="secondary">Paused</Badge>
            )}

            {link.isHidden && (
              <Badge variant="outline" className="text-muted-foreground">
                <EyeOff className="mr-1 size-3" />
                Hidden
              </Badge>
            )}

            <Badge
              variant={
                feedbackTypeBadgeVariant[link.feedbackType] || "secondary"
              }
            >
              {feedbackTypeLabel[link.feedbackType] || link.feedbackType}
            </Badge>
          </div>

          {/* Context badges */}
          <div className="flex flex-wrap gap-2">
            {link.template && (
              <Badge variant="outline" className="text-xs">
                {link.template.name}
              </Badge>
            )}
            {link.organization && (
              <Badge variant="outline" className="text-xs">
                <Building2 className="mr-1 size-3" />
                {link.organization.name}
              </Badge>
            )}
            {link.group && (
              <Badge variant="outline" className="text-xs">
                <Users className="mr-1 size-3" />
                {link.group.name}
              </Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {responseCount} {responseCount === 1 ? "response" : "responses"}
              {link.maxResponses && ` / ${link.maxResponses} max`}
            </span>
            {link.expiresAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {isExpired
                  ? "Expired"
                  : `Expires ${format(new Date(link.expiresAt), "MMM d")}`}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
