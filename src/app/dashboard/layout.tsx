import type React from "react"
import { AppSidebar } from "@/components/sidebar"
import { MainNav } from "@/components/nav"
import { UserNav } from "@/components/user-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

