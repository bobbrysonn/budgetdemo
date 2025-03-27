"use client"

import { useSidebar } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, Calendar, CreditCard, FileText, Home, Menu, PanelLeft, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Budget", href: "/dashboard/budget", icon: CreditCard },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
]

export function AppSidebar() {
  const { isOpen, toggle } = useSidebar()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn("flex items-center gap-2 font-bold", !isOpen && "hidden")}>
          <CreditCard className="h-5 w-5" />
          <span>Project Budget</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
          {isOpen ? <PanelLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                !isOpen && "justify-center px-0",
              )}
            >
              <link.icon className={cn("h-5 w-5", isOpen && "mr-2")} />
              {isOpen && <span>{link.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", !isOpen && "hidden")}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium">SP</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Summer Project</p>
            <p className="text-xs">Pre-Production</p>
          </div>
        </div>
      </div>
    </div>
  )
}

