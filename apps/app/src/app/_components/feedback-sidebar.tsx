"use client";

import * as React from "react";
import NextLink from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Send,
  FileText,
  Link as LinkIcon,
  Target,
  BarChart3,
  Settings,
  Users,
  FolderKanban,
  Shield,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@propsto/ui/atoms/sidebar";
import { NavUser } from "@propsto/ui/molecules/nav-user";
import { AccountSwitcher } from "./account-switcher";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  personalEmail?: string | null;
  organizations?: Organization[];
};

interface FeedbackSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
  currentOrgSlug?: string | null;
}

// Personal navigation items
const personalNavItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, isActive: true },
  { title: "Received", url: "/feedback", icon: MessageSquare },
  { title: "Sent", url: "/feedback/sent", icon: Send },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "My Links", url: "/links", icon: LinkIcon },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

// Organization navigation items (for admins)
const orgNavItems: NavItem[] = [
  { title: "Org Dashboard", url: "", icon: Building2, isActive: true },
  { title: "All Feedback", url: "/feedback", icon: MessageSquare },
  { title: "Members", url: "/members", icon: Users },
  { title: "Groups", url: "/groups", icon: FolderKanban },
  { title: "Moderation", url: "/feedback/pending", icon: Shield },
  { title: "Org Templates", url: "/templates", icon: FileText },
  { title: "Analytics", url: "/feedback/analytics", icon: BarChart3 },
  { title: "Org Settings", url: "/settings", icon: Settings },
];

export function FeedbackSidebar({
  user,
  currentOrgSlug,
  ...props
}: FeedbackSidebarProps): React.JSX.Element {
  const isOrgContext = !!currentOrgSlug;
  const currentOrg = user.organizations?.find(o => o.slug === currentOrgSlug);
  const isOrgAdmin =
    currentOrg?.role === "OWNER" || currentOrg?.role === "ADMIN";

  // Build navigation based on context
  const navItems = isOrgContext
    ? orgNavItems.map(item => ({
        ...item,
        url: `/org/${currentOrgSlug}${item.url}`,
      }))
    : personalNavItems;

  // Context-aware display for footer
  const footerEmail = isOrgContext
    ? user.email // Work email when in org context
    : (user.personalEmail ?? user.email); // Personal email when in personal context

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AccountSwitcher
          userName={user.name}
          userEmail={user.email}
          userImage={user.image}
          personalEmail={user.personalEmail}
          organizations={user.organizations}
          currentOrgSlug={currentOrgSlug}
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isOrgContext ? "Organization" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  asChild
                >
                  <NextLink href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin Link (for org context with admin role) */}
        {isOrgContext && isOrgAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Admin Panel" asChild>
                  <NextLink href={`/org/${currentOrgSlug}/admin`}>
                    <Settings className="size-4" />
                    <span>Admin Panel</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Settings (for personal context only) */}
        {!isOrgContext && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild>
                  <NextLink href="/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name || user.email.split("@")[0],
            email: footerEmail,
            avatar: user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
