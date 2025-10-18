"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, Calendar, BookmarkCheck } from "lucide-react"
import { Button } from "~/components/ui/button"

const mobileNavItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/task-manager", label: "Gestor", icon: BookmarkCheck },
  { href: "/events", label: "Calendario", icon: Calendar },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1">
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="flex h-auto flex-col items-center gap-1 px-2 py-1.5"
              size="sm"
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
