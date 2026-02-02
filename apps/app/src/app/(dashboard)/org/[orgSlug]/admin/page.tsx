/* eslint-disable local-rules/restrict-import */

import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Users, FileText, MessageSquare } from "lucide-react";

interface AdminPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminOverview({
  params,
}: AdminPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization with counts
  const org = await db.organization.findFirst({
    where: {
      slug: {
        slug: orgSlug,
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          templates: true,
          feedbacks: true,
        },
      },
    },
  });

  if (!org) {
    return notFound();
  }

  const stats = [
    {
      title: "Total Members",
      value: org._count.members,
      description: "Active organization members",
      icon: Users,
    },
    {
      title: "Templates",
      value: org._count.templates,
      description: "Feedback templates created",
      icon: FileText,
    },
    {
      title: "Total Feedback",
      value: org._count.feedbacks,
      description: "Feedback items received",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Organization statistics and quick actions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
