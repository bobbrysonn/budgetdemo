"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const mainNavItems = [
  { name: "Overview", href: "/dashboard" },
  { name: "Budget", href: "/dashboard/budget" },
  { name: "Reports", href: "/dashboard/reports" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

