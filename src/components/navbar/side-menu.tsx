"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, GanttChart, Home, CheckSquare, BookmarkCheck, Calendar, BarChart3, Download, HelpCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "~/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "./logout-button"
import { featureFlags } from "~/lib/feature-flags"
import { useIsPWA } from "~/lib/pwa-utils"

const menuItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/task-manager", label: "Gestor de Tareas", icon: BookmarkCheck },
  { href: "/events", label: "Calendario", icon: Calendar },
  { href: "/timeline", label: "Línea de Tiempo", icon: GanttChart, featureFlag: "timeline" as const },
  { href: "/stats", label: "Estadísticas", icon: BarChart3, featureFlag: "stats" as const },
  { href: "/help", label: "Centro de Ayuda", icon: HelpCircle },
]

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const isPWA = useIsPWA()

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuContent = (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-[60] h-screen w-64 border-l border-border bg-card shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="text-lg font-semibold">Menú</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-9 w-9 cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-4 bg-card">
                <nav className="space-y-2">
                  {/* Navigation Links */}
                  {menuItems
                    .filter(item => !item.featureFlag || featureFlags[item.featureFlag])
                    .map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start gap-2 cursor-pointer"
                          size="default"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    )
                  })}

                  {/* Install PWA Link - Only visible on web */}
                  {!isPWA && (
                    <Link href="/install-app" onClick={() => setIsOpen(false)}>
                      <Button
                        variant={pathname === "/install-app" ? "default" : "ghost"}
                        className="w-full justify-start gap-2 cursor-pointer"
                        size="default"
                      >
                        <Download className="h-4 w-4" />
                        <span>Instalar App</span>
                      </Button>
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="my-2 border-t border-border" />

                  {/* Sign Out Button */}
                  <LogoutButton
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    variant="full"
                  />
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 cursor-pointer"
        aria-label="Abrir menú"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Render menu content in portal (outside navbar) */}
      {mounted && createPortal(menuContent, document.body)}
    </>
  )
}
