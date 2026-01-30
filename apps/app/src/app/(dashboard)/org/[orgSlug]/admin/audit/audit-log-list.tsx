"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Badge } from "@propsto/ui/atoms/badge";
import { Button } from "@propsto/ui/atoms/button";
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  UserCog,
  Settings,
  Link as LinkIcon,
  Tag,
  FileText,
  Activity,
} from "lucide-react";
import type { AuditAction } from "@prisma/client";

type AuditLog = {
  id: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  details: unknown;
  createdAt: Date;
  actor: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
};

interface AuditLogListProps {
  logs: AuditLog[];
  orgSlug: string;
  currentPage: number;
  totalPages: number;
}

const actionConfig: Record<
  AuditAction,
  { label: string; icon: typeof Activity; color: string }
> = {
  MEMBER_INVITED: {
    label: "Member invited",
    icon: UserPlus,
    color: "text-green-600",
  },
  MEMBER_REMOVED: {
    label: "Member removed",
    icon: UserMinus,
    color: "text-red-600",
  },
  MEMBER_ROLE_CHANGED: {
    label: "Role changed",
    icon: UserCog,
    color: "text-blue-600",
  },
  SETTINGS_UPDATED: {
    label: "Settings updated",
    icon: Settings,
    color: "text-purple-600",
  },
  ORG_URL_CHANGED: {
    label: "URL changed",
    icon: LinkIcon,
    color: "text-orange-600",
  },
  CATEGORY_CREATED: {
    label: "Category created",
    icon: Tag,
    color: "text-green-600",
  },
  CATEGORY_UPDATED: {
    label: "Category updated",
    icon: Tag,
    color: "text-blue-600",
  },
  CATEGORY_DELETED: {
    label: "Category deleted",
    icon: Tag,
    color: "text-red-600",
  },
  TEMPLATE_CREATED: {
    label: "Template created",
    icon: FileText,
    color: "text-green-600",
  },
  TEMPLATE_UPDATED: {
    label: "Template updated",
    icon: FileText,
    color: "text-blue-600",
  },
  TEMPLATE_DELETED: {
    label: "Template deleted",
    icon: FileText,
    color: "text-red-600",
  },
  OTHER: {
    label: "Other action",
    icon: Activity,
    color: "text-gray-600",
  },
};

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}

function getActorName(actor: AuditLog["actor"]): string {
  if (actor.firstName && actor.lastName) {
    return `${actor.firstName} ${actor.lastName}`;
  }
  return actor.email;
}

function formatDetails(action: AuditAction, details: unknown): string | null {
  if (!details || typeof details !== "object") return null;

  const d = details as Record<string, unknown>;

  switch (action) {
    case "ORG_URL_CHANGED":
      if (d.oldSlug && d.newSlug) {
        return `${d.oldSlug} → ${d.newSlug}`;
      }
      break;
    case "MEMBER_ROLE_CHANGED":
      if (d.oldRole && d.newRole) {
        return `${d.oldRole} → ${d.newRole}`;
      }
      break;
    case "CATEGORY_CREATED":
    case "CATEGORY_UPDATED":
      if (d.name) {
        return `"${d.name}"`;
      }
      break;
    default:
      break;
  }

  return null;
}

export function AuditLogList({
  logs,
  orgSlug,
  currentPage,
  totalPages,
}: AuditLogListProps): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="divide-y">
        {logs.map((log) => {
          const config = actionConfig[log.action];
          const Icon = config.icon;
          const detailText = formatDetails(log.action, log.details);

          return (
            <div
              key={log.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={log.actor.image ?? undefined} />
                <AvatarFallback>
                  {getInitials(log.actor.firstName, log.actor.lastName, log.actor.email)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{getActorName(log.actor)}</span>
                  <Badge variant="outline" className={`${config.color} gap-1`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {log.resourceType}
                  </span>
                  {detailText && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm">{detailText}</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={currentPage <= 1}
            >
              <Link
                href={`/org/${orgSlug}/admin/audit?page=${currentPage - 1}`}
                aria-disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={currentPage >= totalPages}
            >
              <Link
                href={`/org/${orgSlug}/admin/audit?page=${currentPage + 1}`}
                aria-disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
