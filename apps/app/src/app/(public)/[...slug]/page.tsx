import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { decodeSegments, EMAIL_REGEX, resolveTarget } from "./resolve-target";
import { entityMetadata, entityPage } from "./_targets/entity";
import { groupPage } from "./_targets/group";
import { linkMetadata, linkPage } from "./_targets/link";
import { orgPage } from "./_targets/org";
import {
  orgMemberPage,
  profileMetadata,
  profilePage,
} from "./_targets/profile";

interface PublicPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ context?: string | string[] }>;
}

// ?context= on entity links: what the visitor was looking at. Shown as plain
// text (React escapes it) and re-sanitized server-side on submit.
function readContext(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.replace(/\s+/g, " ").trim().slice(0, 300) || undefined;
}

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const slug = decodeSegments((await params).slug);

  if (!slug || slug.length === 0) {
    return { title: "Not Found" };
  }

  // props.to/<email> only redirects; skip the lookup so it uses one
  // rate-limit slot (the page's), not two
  if (EMAIL_REGEX.test(slug[0])) {
    return { title: "props.to" };
  }

  const target = await resolveTarget(slug);
  switch (target?.kind) {
    case "thanks":
      return {
        title: "Thank You | props.to",
        description: "Your feedback has been submitted successfully.",
      };
    case "profile":
      return profileMetadata(target.userId, slug[0]);
    case "link":
      return linkMetadata(target);
    case "entity":
      return entityMetadata(target.entityId);
  }
  if (slug.length === 1) return { title: `${slug[0]} | props.to` };
  if (slug.length <= 3) return { title: `Feedback | props.to` };
  return { title: "props.to" };
}

/**
 * Public pages: user and org slugs share the root namespace, so one catch-all
 * resolves the segments (see resolve-target.ts) and renders the target.
 */
export default async function PublicPage({
  params,
  searchParams,
}: PublicPageProps): Promise<React.ReactNode> {
  const target = await resolveTarget(decodeSegments((await params).slug));

  switch (target?.kind) {
    case "thanks":
      return <ThankYouPage />;
    case "profile":
      return profilePage(target);
    case "org":
      return orgPage(target);
    case "org-member":
      return orgMemberPage(target);
    case "group":
      return groupPage(target);
    case "link":
      return linkPage(target);
    case "entity": {
      const { context } = await searchParams;
      return entityPage({ ...target, context: readContext(context) });
    }
  }
  notFound();
}

function ThankYouPage(): React.ReactNode {
  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your feedback has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your feedback helps people grow and improve. Thank you for taking
            the time to share your thoughts.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/">Learn More About Props.to</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
