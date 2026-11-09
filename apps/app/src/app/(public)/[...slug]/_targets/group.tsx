import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import {
  getFeedbackTemplate,
  getGroupFeedback,
  getGroupForPublicPage,
} from "@propsto/data/repos";
import { auth } from "@/server/auth.server";
import { labelAnswers } from "@/lib/template-fields";

// /<orgSlug>/<groupSlug>: group page
export async function groupPage({
  groupId,
  orgSlug,
  groupSlug,
}: {
  groupId: string;
  orgSlug: string;
  groupSlug: string;
}): Promise<React.ReactNode> {
  // Visibility follows the viewer: ORGANIZATION groups show to signed-in members
  const session = await auth();
  const groupResult = await getGroupForPublicPage(groupId, session?.user?.id);

  if (!groupResult.success || !groupResult.data) {
    notFound();
  }

  const group = groupResult.data;

  // Get user's org slug for building URLs
  const getMemberOrgSlug = (
    user: (typeof group.users)[0],
    organizationId: string,
  ): string | null => {
    const orgSlugRecord = user.organizationSlugs.find(
      s => s.scopedToOrgId === organizationId,
    );
    return orgSlugRecord?.slug ?? null;
  };

  // Approved team feedback is the team's record, shown to org members only
  let teamFeedback: {
    id: string;
    from: string;
    when: Date;
    answers: { key: string; label: string; value: unknown }[];
  }[] = [];
  if (group.viewerIsMember) {
    const fbResult = await getGroupFeedback(group.id, { take: 10 });
    const items = fbResult.success ? fbResult.data.feedbacks : [];
    const templateIds = [...new Set(items.map(f => f.templateId))];
    const templates = await Promise.all(templateIds.map(getFeedbackTemplate));
    const fieldsByTemplate = new Map(
      templateIds.map((id, i) => [id, templates[i]?.data?.fields ?? []]),
    );
    teamFeedback = items.map(f => ({
      id: f.id.toString(),
      from:
        f.visibility === "ANONYMOUS"
          ? "Anonymous"
          : [f.submitter?.firstName, f.submitter?.lastName]
              .filter(Boolean)
              .join(" ") ||
            f.submitterName ||
            f.submitterEmail ||
            "Anonymous",
      when: f.createdAt,
      answers: labelAnswers(
        fieldsByTemplate.get(f.templateId) ?? [],
        (f.fieldsData as Record<string, unknown> | null) ?? {},
      ),
    }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Parent breadcrumb */}
      {group.parent && (
        <p className="mb-4 text-sm text-muted-foreground">
          <a
            href={`/${orgSlug}/${group.parent.slug.slug}`}
            className="hover:underline"
          >
            ← {group.parent.name}
          </a>
        </p>
      )}

      {/* Group Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Users className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        {group.description && (
          <p className="text-muted-foreground">{group.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {group.organization.name} • {group.users.length} member
          {group.users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Group Feedback Links */}
      {group.feedbackLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Group Feedback</h2>
          <div className="grid gap-4">
            {group.feedbackLinks.map(link => (
              <a
                key={link.id}
                href={`/${orgSlug}/${groupSlug}/${link.slug}`}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-medium">{link.name}</h3>
                {link.template && (
                  <p className="text-sm text-muted-foreground">
                    {link.template.name}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Subgroups */}
      {group.children.length > 0 && (
        <div className="mb-8" data-testid="subgroups">
          <h2 className="text-lg font-semibold mb-4">Teams</h2>
          <div className="grid gap-4">
            {group.children.map(child => (
              <a
                key={child.id}
                href={`/${orgSlug}/${child.slug.slug}`}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium">{child.name}</h3>
                    {child.description && (
                      <p className="text-sm text-muted-foreground">
                        {child.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {child.memberCount} member
                    {child.memberCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Members</h2>
        <div className="grid gap-4">
          {group.users.map(user => {
            const userOrgSlug = getMemberOrgSlug(user, group.organizationId);
            const displayName =
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              userOrgSlug ||
              "Member";
            const initials = displayName
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <a
                key={user.id}
                href={userOrgSlug ? `/${orgSlug}/${userOrgSlug}` : undefined}
                className={`flex items-center gap-4 p-4 border rounded-lg ${userOrgSlug ? "hover:bg-muted/50 transition-colors cursor-pointer" : ""}`}
              >
                <Avatar className="size-12">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{displayName}</h3>
                  {userOrgSlug && (
                    <p className="text-sm text-muted-foreground">
                      @{userOrgSlug}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Approved team feedback, visible to org members */}
      {teamFeedback.length > 0 && (
        <div className="mt-8" data-testid="team-feedback">
          <h2 className="text-lg font-semibold mb-4">Team feedback</h2>
          <div className="grid gap-4">
            {teamFeedback.map(f => (
              <div key={f.id} className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  From {f.from} ·{" "}
                  {formatDistanceToNow(f.when, { addSuffix: true })}
                </p>
                {f.answers.map(a => (
                  <div key={a.key}>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {String(a.value)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
