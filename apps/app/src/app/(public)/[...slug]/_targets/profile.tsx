import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getEmailProfilePath,
  getUser as _getUser,
  getUserFeedbackLinks,
} from "@propsto/data/repos";
import { UserProfileHeader } from "../_components/user-profile-header";

const getUser = cache(_getUser);

export async function profileMetadata(
  userId: string,
  fallbackName: string,
): Promise<Metadata> {
  const userResult = await getUser({ id: userId });
  if (userResult.success && userResult.data) {
    const name = userResult.data.firstName ?? fallbackName;
    return {
      title: `${name} | props.to`,
      description: `Give feedback to ${name} on props.to`,
    };
  }
  return { title: `${fallbackName} | props.to` };
}

export async function profilePage({
  userId,
  slug,
  email,
}: {
  userId: string;
  slug: string;
  email?: string;
}): Promise<React.ReactNode> {
  // props.to/<email> is a shortcut: send it to the real address
  if (email) {
    const path = await getEmailProfilePath(userId, email);
    redirect(path.success && path.data ? path.data : `/${slug}`);
  }

  // Show user profile with their personal public feedback links (org links live under /<org>/<user>)
  const linksResult = await getUserFeedbackLinks(userId, {
    organizationId: null,
    isActive: true,
    excludeHidden: true,
  });
  const links = linksResult.success ? linksResult.data.links : [];

  return (
    <div className="max-w-2xl mx-auto">
      <UserProfileHeader userId={userId} slug={slug} />
      {links.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Feedback Links</h2>
          <div className="grid gap-4">
            {links.map(link => (
              <a
                key={link.id}
                href={`/${slug}/${link.slug}`}
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
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          No public feedback links available
        </p>
      )}
    </div>
  );
}

// /<orgSlug>/<userSlug>: org member profile (exclude hidden links)
export async function orgMemberPage({
  userId,
  organizationId,
  orgSlug,
  userSlug,
}: {
  userId: string;
  organizationId: string;
  orgSlug: string;
  userSlug: string;
}): Promise<React.ReactNode> {
  const linksResult = await getUserFeedbackLinks(userId, {
    organizationId,
    isActive: true,
    excludeHidden: true,
  });
  const links = linksResult.success ? linksResult.data.links : [];

  return (
    <div className="max-w-2xl mx-auto">
      <UserProfileHeader
        userId={userId}
        slug={userSlug}
        organizationId={organizationId}
      />
      {links.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Feedback Links</h2>
          <div className="grid gap-4">
            {links.map(link => (
              <a
                key={link.id}
                href={`/${orgSlug}/${userSlug}/${link.slug}`}
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
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          No feedback links available
        </p>
      )}
    </div>
  );
}
