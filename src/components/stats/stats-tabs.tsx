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

interface Tab {
  id: StatsSection
  label: string
  shortLabel: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: Tab[] = [
  { id: "tasks", label: "Tareas", shortLabel: "Tareas", icon: ListChecks },
  { id: "recurrences", label: "Hábitos", shortLabel: "Hábitos", icon: Repeat },
  { id: "occurrences", label: "Ocurrencias", shortLabel: "Ocurr.", icon: CalendarCheck },
  { id: "calendar", label: "Calendario", shortLabel: "Cal.", icon: Calendar },
  { id: "kpis", label: "KPIs", shortLabel: "KPIs", icon: TrendingUp },
  { id: "insights", label: "Insights", shortLabel: "Insight", icon: Lightbulb },
]

interface StatsTabsProps {
  activeSection: StatsSection
  onSectionChange: (section: StatsSection) => void
}

export function StatsTabs({ activeSection, onSectionChange }: StatsTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 p-2 min-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSection === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                "hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.shortLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
