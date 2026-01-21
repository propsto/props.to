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
  User,
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NextLink href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MessageSquare className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {isOrgContext ? currentOrg?.name : "Props.to"}
                  </span>
                  <span className="truncate text-xs">
                    {isOrgContext ? "Organization" : "Personal"}
                  </span>
                </div>
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Context Switcher */}
        {user.organizations && user.organizations.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Context</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Personal"
                  isActive={!isOrgContext}
                  asChild
                >
                  <NextLink href="/">
                    <User className="size-4" />
                    <span>Personal</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user.organizations.map(org => (
                <SidebarMenuItem key={org.id}>
                  <SidebarMenuButton
                    tooltip={org.name}
                    isActive={currentOrgSlug === org.slug}
                    asChild
                  >
                    <NextLink href={`/org/${org.slug}`}>
                      <Building2 className="size-4" />
                      <span>{org.name}</span>
                    </NextLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

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
            email: user.email,
            avatar: user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
