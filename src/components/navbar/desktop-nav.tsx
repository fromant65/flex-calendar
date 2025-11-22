"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, Calendar, GanttChart, BookmarkCheck, Shield } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useSession } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/task-manager", label: "Gestor de Tareas", icon: BookmarkCheck },
  { href: "/events", label: "Calendario", icon: Calendar },
  { href: "/timeline", label: "Línea de Tiempo", icon: GanttChart },
]

export function DesktopNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="gap-2 transition-all cursor-pointer"
              size="default"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          </Link>
        )
      })}
      
      {isAdmin && (
        <Link href="/admin">
          <Button
            variant={pathname === "/admin" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Button>
        </Link>
      )}
    </div>
  )
}
