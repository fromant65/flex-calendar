"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarView } from "~/types"
import HelpTip from "~/components/ui/help-tip"

// Modular component - CalendarHeader
// Handles calendar navigation and view selection

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onNavigatePrevious: () => void
  onNavigateNext: () => void
  onGoToToday: () => void
  getDateRangeLabel: () => string
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigatePrevious,
  onNavigateNext,
  onGoToToday,
  getDateRangeLabel,
}: CalendarHeaderProps) {
  return (
    <div className="p-2 lg:p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer" size="sm" onClick={onNavigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="cursor-pointer" size="sm" onClick={onGoToToday}>
            Hoy
          </Button>
          <Button variant="outline" className="cursor-pointer" size="sm" onClick={onNavigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-xs lg:text-sm text-muted-foreground truncate">{getDateRangeLabel()}</span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="hidden lg:block">
          <HelpTip title="Ayuda del calendario">
            Puedes arrastrar eventos para reubicarlos.
          </HelpTip>
        </div>
        <Button
          variant={view === "day" ? "default" : "outline"}
          className="cursor-pointer flex-1 sm:flex-none"
          size="sm"
          onClick={() => onViewChange("day")}
        >
          Día
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          className="cursor-pointer flex-1 sm:flex-none"
          size="sm"
          onClick={() => onViewChange("week")}
        >
          Semana
        </Button>
        <Button
          variant={view === "month" ? "default" : "outline"}
          className="cursor-pointer flex-1 sm:flex-none"
          size="sm"
          onClick={() => onViewChange("month")}
        >
          Mes
        </Button>
      </div>
    </div>
  )
}
