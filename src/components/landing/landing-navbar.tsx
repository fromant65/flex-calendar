"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { motion } from "framer-motion"
import { FlexCalendarIcon } from "~/components/ui/flex-calendar-icon"

interface LandingNavbarProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

export function LandingNavbar({ onLoginClick, onRegisterClick }: LandingNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) return null

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hidden sm:flex">
              <FlexCalendarIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:flex">
              Flex Calendar
            </span>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-9 w-9 rounded-lg cursor-pointer"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onLoginClick}
              className="rounded-lg text-sm font-medium cursor-pointer"
            >
              Iniciar Sesión
            </Button>
            
            <Button
              onClick={onRegisterClick}
              className="rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md cursor-pointer"
            >
              Registrarse
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}
