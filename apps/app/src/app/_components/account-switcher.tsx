"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronsUpDown, Check, Building2, User } from "lucide-react";
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
  currentOrgSlug?: string | null;
}

export function AccountSwitcher({
  userName,
  userEmail,
  userImage,
  personalEmail,
  organizations = [],
  currentOrgSlug,
}: AccountSwitcherProps): React.JSX.Element {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const isOrgContext = !!currentOrgSlug;
  const currentOrg = organizations.find(o => o.slug === currentOrgSlug);

  // Determine display info based on context
  const displayName = isOrgContext
    ? (currentOrg?.name ?? "Organization")
    : "Personal";
  const displayEmail = isOrgContext ? userEmail : (personalEmail ?? userEmail);
  const displaySubtext = isOrgContext ? "Work" : "Personal";

  const handleSwitchToPersonal = () => {
    router.push("/");
  };

  const handleSwitchToOrg = (slug: string) => {
    router.push(`/org/${slug}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isOrgContext ? (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
              ) : (
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="rounded-lg">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displaySubtext}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            {/* Personal Account */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Personal
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleSwitchToPersonal}
              className="gap-3 p-2"
            >
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
              {!isOrgContext && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>

            {/* Organization Accounts */}
            {organizations.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organizations
                </DropdownMenuLabel>
                {organizations.map(org => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleSwitchToOrg(org.slug)}
                    className="gap-3 p-2"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{org.name}</span>
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
                    {currentOrgSlug === org.slug && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
