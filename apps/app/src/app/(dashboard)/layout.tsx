import { headers } from "next/headers";
import { SidebarInset, SidebarProvider } from "@propsto/ui/atoms/sidebar";
import { SidebarTrigger } from "@propsto/ui/atoms/sidebar";
import { Separator } from "@propsto/ui/atoms/separator";
import { canUserMoveOn } from "@propsto/auth/post-auth-check";
import { redirect } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import { auth } from "@/server/auth.server";
import { FeedbackSidebar } from "@/app/_components/feedback-sidebar";

// Extract org slug from URL path (e.g., /org/acme/... → "acme")
function extractOrgSlug(pathname: string): string | null {
  const match = pathname.match(/^\/org\/([^/]+)/);
  return match ? match[1] : null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(constServer.AUTH_URL);
  }

  if (!canUserMoveOn(session.user)) {
    return redirect(constServer.AUTH_URL);
  }

  // Detect org context from URL
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "";
  const currentOrgSlug = extractOrgSlug(pathname);

  // Transform session user to sidebar user format
  const sidebarUser = {
    id: session.user.id,
    name:
      session.user.firstName && session.user.lastName
        ? `${session.user.firstName} ${session.user.lastName}`
        : session.user.email?.split("@")[0] || "User",
    email: session.user.email || "",
    image: session.user.image || undefined,
    username: session.user.username,
    personalEmail: session.user.personalEmail,
    organizations: session.user.organizations?.map(org => ({
      id: org.organizationId,
      name: org.organizationName,
      slug: org.organizationSlug,
      role: org.role,
    })),
  };

  return (
    <SidebarProvider>
      <FeedbackSidebar user={sidebarUser} currentOrgSlug={currentOrgSlug} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
