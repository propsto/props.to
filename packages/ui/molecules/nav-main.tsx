"use client";

import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../atoms/sidebar";

export function NavMain({
  items,
}: Readonly<{
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}>): React.ReactNode {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="space-x-1 text-sm">
              {item.icon ? <item.icon /> : null}
              <span>{item.title}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items?.map(subItem => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={subItem.url}>{subItem.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
