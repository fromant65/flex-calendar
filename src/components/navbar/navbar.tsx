"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "~/components/ui/button"
import { SideMenu } from "./side-menu"
import { AdaptiveDesktopNav } from "./adaptive-desktop-nav"
import { FlexCalendarIcon } from "~/components/ui/flex-calendar-icon"
import { NotificationBell } from "~/components/notifications/notification-bell"
import { NotificationMenu } from "~/components/notifications/notification-menu"

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Don't show navbar on login page
  if (pathname === "/") {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
              <FlexCalendarIcon className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline text-lg font-semibold text-foreground">Flex Calendar</span>
          </Link>

          {/* Desktop Navigation (≥sm) - Only when logged in */}
          {status === "authenticated" && (
            <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
              <AdaptiveDesktopNav />
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell - Only when logged in */}
            {status === "authenticated" && (
              <NotificationBell onClick={() => setNotificationsOpen(true)} />
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 transition-all hover:rotate-12 cursor-pointer"
              aria-label="Toggle theme"
              disabled={!mounted}
            >
              {mounted && theme === "light" ? (
                <Moon className="h-4 w-4 transition-transform" />
              ) : (
                <Sun className="h-4 w-4 transition-transform" />
              )}
            </Button>

            {/* Side Menu - Only when logged in */}
            {status === "authenticated" && (
              <SideMenu />
            )}
          </div>
        </div>
      </div>

      {/* Notification Menu */}
      {status === "authenticated" && (
        <NotificationMenu
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        />
      )}
    </nav>
  )
}
