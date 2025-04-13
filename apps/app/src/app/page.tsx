import { SidebarInset, SidebarProvider } from "@propsto/ui/atoms/sidebar";
import {
  AppSidebar,
  SiteHeader,
  SectionCards,
  ChartAreaInteractive,
  DataTable,
} from "@propsto/ui/molecules";
import { canUserMoveOn } from "@propsto/auth/post-auth-check";
import React from "react";
import { redirect } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import { auth } from "@/server/auth.server";
import data from "./data.json";

export default async function Page(): Promise<React.ReactNode> {
  const session = await auth();
  if (session?.user) {
    if (!canUserMoveOn(session.user)) {
      return redirect(constServer.AUTH_URL);
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
