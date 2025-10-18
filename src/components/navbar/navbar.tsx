"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "~/components/ui/button"
import { MobileNav } from "./mobile-nav"
import { SideMenu } from "./side-menu"
import { AdaptiveDesktopNav } from "./adaptive-desktop-nav"
import { LogoutButton } from "./logout-button"
import { FlexCalendarIcon } from "~/components/ui/flex-calendar-icon"

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

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
          {/* Logo - Hidden on mobile */}
          <Link href="/dashboard" className="hidden sm:flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
              <FlexCalendarIcon className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">Flex Calendar</span>
          </Link>

          {/* Desktop Navigation (≥sm) - Only when logged in */}
          {status === "authenticated" && (
            <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
              <AdaptiveDesktopNav />
            </div>
          )}

          {/* Mobile Navigation (<sm) - Only when logged in */}
          {status === "authenticated" && (
            <div className="flex sm:hidden items-center gap-1">
              <MobileNav />
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - sm to lg: before menu, lg+: before menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 transition-all hover:rotate-12 cursor-pointer sm:order-1 lg:order-1"
              aria-label="Toggle theme"
              disabled={!mounted}
            >
              {mounted && theme === "light" ? (
                <Moon className="h-4 w-4 transition-transform" />
              ) : (
                <Sun className="h-4 w-4 transition-transform" />
              )}
            </Button>

            {/* Side Menu - sm and up when logged in */}
            {status === "authenticated" && (
              <div className="hidden sm:block sm:order-2 lg:order-2">
                <SideMenu />
              </div>
            )}

            {/* Side Menu - Mobile (<sm) - when logged in */}
            {status === "authenticated" && (
              <div className="sm:hidden">
                <SideMenu />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
