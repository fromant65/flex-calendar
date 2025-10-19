"use client"

import { cn } from "~/lib/utils"
import { 
  ListChecks, 
  Repeat, 
  Calendar, 
  CalendarCheck, 
  TrendingUp, 
  Lightbulb 
} from "lucide-react"
import type { StatsSection } from "./types"

interface Section {
  id: StatsSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const sections: Section[] = [
  { id: "tasks", label: "Tareas", icon: ListChecks },
  { id: "recurrences", label: "Hábitos", icon: Repeat },
  { id: "occurrences", label: "Ocurrencias", icon: CalendarCheck },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "kpis", label: "KPIs", icon: TrendingUp },
  { id: "insights", label: "Insights", icon: Lightbulb },
]

interface StatsNavigationProps {
  activeSection: StatsSection
  onSectionChange: (section: StatsSection) => void
}

export function StatsNavigation({ activeSection, onSectionChange }: StatsNavigationProps) {
  return (
    <nav className="sticky top-20 space-y-1">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "flex cursor-pointer w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground border-l-2 border-primary"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
            <span>{section.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
