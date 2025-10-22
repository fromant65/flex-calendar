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
            <div className="text-sm font-medium mb-1">¿Qué significan los colores?</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted/50 border border-border inline-block" />
                <span>Evento completado (grisado)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-3/20 border border-chart-3 inline-block" />
                <span>Única</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-2/20 border border-chart-2 inline-block" />
                <span>Hábito</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-4/20 border border-chart-4 inline-block" />
                <span>Hábito+</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-5/20 border border-chart-5 inline-block" />
                <span>Recurrente finita</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-1/20 border border-chart-1 inline-block" />
                <span>Fija (única o repetitiva)</span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Puedes arrastrar eventos para reubicarlos. Haz clic en un evento para ver detalles.</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Los eventos completados no se pueden reprogramar, recuerda colocar el evento en el rango horario correcto antes de completarlo o saltearlo.</div>
            </div>
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
