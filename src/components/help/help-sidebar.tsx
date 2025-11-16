"use client"

import React from "react"
import { HelpTip } from "~/components/ui/help-tip"
import { Card } from "~/components/ui/card"
import { ChevronRight, ChevronDown, Home } from "lucide-react"

type HelpNode = {
  id: string
  title: string
  children?: HelpNode[]
}

interface HelpSidebarProps {
  sections: HelpNode[]
  activeId?: string
  onSelect: (id: string) => void
}

export function HelpSidebar({ sections, activeId, onSelect }: HelpSidebarProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    dashboard: true,
    tasks: false,
    "task-manager": false,
    events: false,
    timeline: false,
    install: false,
  })

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const toggle = (id: string) => {
    setOpen((s) => ({ ...s, [id]: !s[id] }))
  }

  const handleSelect = (id: string) => {
    onSelect(id)
    setMobileMenuOpen(false) // Close mobile menu after selection
    // Smooth scroll to top on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Get current section title
  const getCurrentTitle = () => {
    if (!activeId) return "Inicio"
    for (const section of sections) {
      if (section.id === activeId) return section.title
      if (section.children) {
        const child = section.children.find(c => c.id === activeId)
        if (child) return child.title
      }
    }
    return "Inicio"
  }

  return (
    <>
      {/* Mobile custom dropdown */}
      <div className="lg:hidden mb-4">
        <Card className="p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            📚 Selecciona una sección
          </label>
          
          {/* Custom dropdown button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <span className="flex items-center gap-2">
              {!activeId && <Home className="h-4 w-4 text-primary" />}
              {getCurrentTitle()}
            </span>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Custom dropdown menu */}
          {mobileMenuOpen && (
            <div className="absolute left-4 right-4 mt-2 z-50 max-h-[60vh] overflow-y-auto rounded-lg border-2 border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                {/* Home option */}
                <button
                  onClick={() => handleSelect("")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    !activeId 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <Home className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Inicio</span>
                  {!activeId && <span className="ml-auto text-xs">●</span>}
                </button>

                <div className="h-px bg-border my-2" />

                {/* Sections */}
                {sections.map((s) => (
                  <div key={s.id} className="mb-1">
                    <button
                      onClick={() => handleSelect(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        activeId === s.id 
                          ? "bg-primary/10 text-primary font-semibold" 
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm font-semibold">{s.title}</span>
                      {activeId === s.id && <span className="ml-auto text-xs">●</span>}
                    </button>

                    {/* Children */}
                    {s.children && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-border/50 pl-3">
                        {s.children.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelect(c.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-left ${
                              activeId === c.id 
                                ? "bg-muted/60 text-primary font-semibold border-l-2 border-primary" 
                                : "hover:bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            <span className="text-xs font-medium">{c.title}</span>
                            {activeId === c.id && <span className="ml-auto text-xs">●</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backdrop */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/20 animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </Card>
      </div>

      <aside className="hidden lg:block w-64">
        <Card className="p-4 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground">📚 Navegación</h3>
            <HelpTip title="Navegación de ayuda" side="left">
              Selecciona una sección para ver contenido detallado, guías paso a paso y ejemplos interactivos.
            </HelpTip>
          </div>

          <nav className="space-y-1">
            {sections.map((s) => (
              <div key={s.id} className="border-b border-border/50 last:border-0 pb-2 mb-2">
                <div className="flex items-center gap-1">
                  {/* Accordion toggle button (only for sections with children) */}
                  {s.children ? (
                    <button
                      className="p-2 rounded-lg transition-all hover:bg-muted/50"
                      onClick={() => toggle(s.id)}
                      title={open[s.id] ? "Contraer" : "Expandir"}
                    >
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform text-muted-foreground ${open[s.id] ? "rotate-0" : "-rotate-90"}`} 
                      />
                    </button>
                  ) : (
                    <span className="w-10" />
                  )}

                  {/* Navigation button */}
                  <button
                    className={`flex-1 text-left flex items-center gap-2.5 py-2.5 px-3 rounded-lg transition-all hover:bg-primary/10 ${
                      activeId === s.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                    }`}
                    onClick={() => handleSelect(s.id)}
                  >
                    <span className="flex-1 text-sm font-medium">{s.title}</span>
                    {activeId === s.id && (
                      <span className="text-xs">●</span>
                    )}
                  </button>
                </div>

                {s.children && open[s.id] && (
                  <div className="pl-6 mt-1 space-y-1">
                    {s.children.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(c.id)}
                        className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-muted/30 ${
                          activeId === c.id 
                            ? "bg-muted/40 font-semibold text-primary border-l-2 border-primary" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </Card>
      </aside>
    </>
  )
}

export default HelpSidebar
