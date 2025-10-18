"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, BookmarkCheck, Calendar } from "lucide-react"
import { Button } from "~/components/ui/button"

export function AdaptiveDesktopNav() {
  const pathname = usePathname()

  return (
    <>
      {/* sm to lg: Tareas, Gestor, Calendario */}
      <div className="hidden sm:flex lg:hidden items-center gap-1">
        <Link href="/tasks">
          <Button
            variant={pathname === "/tasks" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <CheckSquare className="h-4 w-4" />
            <span>Tareas</span>
          </Button>
        </Link>
        
        <Link href="/task-manager">
          <Button
            variant={pathname === "/task-manager" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>Gestor</span>
          </Button>
        </Link>
        
        <Link href="/events">
          <Button
            variant={pathname === "/events" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendario</span>
          </Button>
        </Link>
      </div>

      {/* lg and up: Inicio, Tareas, Gestor, Calendario */}
      <div className="hidden lg:flex items-center gap-1">
        <Link href="/dashboard">
          <Button
            variant={pathname === "/dashboard" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </Button>
        </Link>

        <Link href="/tasks">
          <Button
            variant={pathname === "/tasks" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <CheckSquare className="h-4 w-4" />
            <span>Tareas</span>
          </Button>
        </Link>
        
        <Link href="/task-manager">
          <Button
            variant={pathname === "/task-manager" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>Gestor</span>
          </Button>
        </Link>
        
        <Link href="/events">
          <Button
            variant={pathname === "/events" ? "default" : "ghost"}
            className="gap-2 transition-all cursor-pointer"
            size="default"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendario</span>
          </Button>
        </Link>
      </div>
    </>
  )
}
