"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import type { TimelineViewMode } from "./task-manager-timeline"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface TimelineNavigationControlsProps {
  currentDate: Date
  viewMode: TimelineViewMode
  onViewModeChange: (mode: TimelineViewMode) => void
  onNavigate: (direction: "prev" | "next") => void
  onToday: () => void
}

export function TimelineNavigationControls({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onToday,
}: TimelineNavigationControlsProps) {
  const getDateLabel = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      case "week":
        return format(currentDate, "'Semana del' d 'de' MMMM, yyyy", { locale: es })
      case "month":
        return format(currentDate, "MMMM 'de' yyyy", { locale: es })
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Navigation */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("prev")}
          className="h-7 w-7 p-0"
          aria-label="Período anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-7 gap-1.5 px-2 text-xs"
          aria-label="Ir a hoy"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Hoy</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("next")}
          className="h-7 w-7 p-0"
          aria-label="Siguiente período"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <div className="ml-2 text-sm font-medium capitalize text-foreground">
          {getDateLabel()}
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-0.5 rounded-md bg-muted p-0.5 w-fit">
        <Button
          variant={viewMode === "day" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("day")}
          className="h-6 px-2 text-xs"
        >
          Día
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("week")}
          className="h-6 px-2 text-xs"
        >
          Semana
        </Button>
        <Button
          variant={viewMode === "month" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("month")}
          className="h-6 px-2 text-xs"
        >
          Mes
        </Button>
      </div>
    </div>
  )
}
