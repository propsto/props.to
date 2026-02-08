"use client";

import * as React from "react";
import NextLink from "next/link";
import { Building2, User, ChevronRight } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@propsto/ui/atoms/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@propsto/ui/atoms/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Badge } from "@propsto/ui/atoms/badge";

type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

interface AccountSwitcherProps {
  userName: string;
  userEmail: string;
  userImage?: string;
  personalEmail?: string | null;
  organizations?: Organization[];
}

export function AccountSwitcher({
  userName,
  userEmail,
  userImage,
  personalEmail,
  organizations = [],
}: AccountSwitcherProps): React.JSX.Element {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="rounded-lg">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Props.to</span>
                <span className="truncate text-xs text-muted-foreground">
                  {userName}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            {/* Personal Identity */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Personal
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-3 p-2" disabled>
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="rounded-lg">
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {personalEmail ?? userEmail}
                </span>
              </div>
            </DropdownMenuItem>

            {/* Organizations */}
            {organizations.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organizations
                </DropdownMenuLabel>
                {organizations.map(org => {
                  const isAdmin = org.role === "OWNER" || org.role === "ADMIN";
                  const content = (
                    <>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {org.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                          >
                            {org.role.toLowerCase()}
                          </Badge>
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {userEmail}
                        </span>
                      </div>
                      {isAdmin && (
                        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                      )}
                    </>
                  );

                  // Admins get a link to the org admin panel
                  if (isAdmin) {
                    return (
                      <DropdownMenuItem
                        key={org.id}
                        className="gap-3 p-2"
                        asChild
                      >
                        <NextLink href={`/org/${org.slug}/admin`}>
                          {content}
                        </NextLink>
                      </DropdownMenuItem>
                    );
                  }

                  // Regular members see their org but no admin link
                  return (
                    <DropdownMenuItem
                      key={org.id}
                      className="gap-3 p-2"
                      disabled
                    >
                      {content}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
