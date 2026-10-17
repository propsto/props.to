"use client";

import * as React from "react";
import NextLink from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Send,
  FileText,
  Link as LinkIcon,
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
}

// Unified navigation — shows everything in one view
const navItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, isActive: true },
  { title: "Received", url: "/feedback", icon: MessageSquare },
  { title: "Sent", url: "/feedback/sent", icon: Send },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "My Links", url: "/links", icon: LinkIcon },
  // Goals, Reports and Settings are hidden for the pilot (gate 5)
];

export function FeedbackSidebar({
  user,
  ...props
}: FeedbackSidebarProps): React.JSX.Element {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AccountSwitcher
          userName={user.name}
          userEmail={user.email}
          userImage={user.image}
          personalEmail={user.personalEmail}
          organizations={user.organizations}
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name || user.email.split("@")[0],
            email: user.personalEmail ?? user.email,
            avatar: user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
