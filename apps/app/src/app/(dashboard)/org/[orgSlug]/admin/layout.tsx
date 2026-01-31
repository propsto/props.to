import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import { constServer } from "@propsto/constants/server";
import { cn } from "@propsto/ui/lib/utils";
import { Building2, Users, Settings, LayoutDashboard, ScrollText } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminLayout({
  children,
  params,
}: AdminLayoutProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return redirect(constServer.AUTH_URL);
  }

  // Do fresh DB lookup for membership to handle slug changes
  // (session cache may have stale org slug after URL change)
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: {
          slug: orgSlug,
        },
      },
    },
    select: {
      role: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  // Check if user is member of this org
  if (!membership) {
    return notFound();
  }

  // Check if user has admin privileges (OWNER or ADMIN)
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return redirect(`/org/${orgSlug}`);
  }

  const navItems = [
    {
      href: `/org/${orgSlug}/admin`,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: `/org/${orgSlug}/admin/members`,
      label: "Members",
      icon: Users,
    },
    {
      href: `/org/${orgSlug}/admin/settings`,
      label: "Settings",
      icon: Settings,
    },
    {
      href: `/org/${orgSlug}/admin/audit`,
      label: "Audit Log",
      icon: ScrollText,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-semibold">{membership.organization.name}</h1>
          <p className="text-sm text-muted-foreground">Organization Admin</p>
        </div>
      </div>

      <nav className="flex gap-2 border-b">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary/50 hover:text-primary transition-colors",
              "-mb-px"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1">{children}</div>
    </div>
  );
}
