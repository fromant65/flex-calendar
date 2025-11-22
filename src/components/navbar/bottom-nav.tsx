"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, Calendar, BookmarkCheck } from "lucide-react"
import { Button } from "~/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/task-manager", label: "Gestor", icon: BookmarkCheck },
  { href: "/events", label: "Calendario", icon: Calendar },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show bottom nav on login page
  if (pathname === "/") {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href} className="flex items-center justify-center">
              <Button
                variant={isActive ? "default" : "ghost"}
                className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-none"
                size="sm"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
