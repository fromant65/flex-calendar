"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { OccurrenceWithTask } from "~/types"
import { TimelineNavigationControls } from "./timeline-navigation-controls"
import { OccurrenceTimelineCard } from "./occurrence-timeline-card"
import { TimelineDateGrid } from "./timeline-date-grid"
import { TimelineFilterBar } from "./timeline-filter-bar"
import { HelpTip } from "~/components/ui/help-tip"
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay
} from "date-fns"

export type TimelineViewMode = "day" | "week" | "month"
export type TimelineGrouping = "none" | "task" | "status"

interface TaskManagerTimelineProps {
  occurrences: OccurrenceWithTask[]
  onOccurrenceClick?: (occurrence: OccurrenceWithTask) => void
  onCompleteOccurrence?: (occurrenceId: number) => void
  onSkipOccurrence?: (occurrenceId: number) => void
  onEditOccurrence?: (occurrence: OccurrenceWithTask) => void
}

export function TaskManagerTimeline({
  occurrences,
  onOccurrenceClick,
  onCompleteOccurrence,
  onSkipOccurrence,
  onEditOccurrence,
}: TaskManagerTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<TimelineViewMode>("week")
  const [grouping, setGrouping] = useState<TimelineGrouping>("none")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "Pending",
    "In Progress",
    "Completed",
    "Skipped"
  ])

  // Calculate date range based on view mode
  const { startDate, endDate, dateRange } = useMemo(() => {
    let start: Date
    let end: Date

    switch (viewMode) {
      case "day":
        start = startOfDay(currentDate)
        end = endOfDay(currentDate)
        break
      case "week":
        start = startOfWeek(currentDate, { weekStartsOn: 1 })
        end = endOfWeek(currentDate, { weekStartsOn: 1 })
        break
      case "month":
        start = startOfMonth(currentDate)
        end = endOfMonth(currentDate)
        break
    }

    const range = eachDayOfInterval({ start, end })
    
    return { startDate: start, endDate: end, dateRange: range }
  }, [currentDate, viewMode])

  // Filter occurrences by date range and status
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occurrence) => {
      // Filter by status
      if (!selectedStatuses.includes(occurrence.status)) {
        return false
      }

      // Filter by date range - check if either targetDate or limitDate falls within range
      const targetInRange = occurrence.targetDate && isWithinInterval(occurrence.targetDate, {
        start: startDate,
        end: endDate,
      })
      
      const limitInRange = occurrence.limitDate && isWithinInterval(occurrence.limitDate, {
        start: startDate,
        end: endDate,
      })

      const startInRange = isWithinInterval(occurrence.startDate, {
        start: startDate,
        end: endDate,
      })

      return targetInRange || limitInRange || startInRange
    })
  }, [occurrences, startDate, endDate, selectedStatuses])

  // Group occurrences by date and optionally by task or status
  const groupedOccurrences = useMemo(() => {
    const groups = new Map<string, OccurrenceWithTask[]>()

    filteredOccurrences.forEach((occurrence) => {
      let groupKey = ""

      if (grouping === "task") {
        groupKey = `task-${occurrence.task.id}`
      } else if (grouping === "status") {
        groupKey = `status-${occurrence.status}`
      } else {
        groupKey = "all"
      }

      const existing = groups.get(groupKey) ?? []
      groups.set(groupKey, [...existing, occurrence])
    })

    return groups
  }, [filteredOccurrences, grouping])

  // Navigation handlers
  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)

    if (direction === "prev") {
      switch (viewMode) {
        case "day":
          setCurrentDate(subDays(newDate, 1))
          break
        case "week":
          setCurrentDate(subWeeks(newDate, 1))
          break
        case "month":
          setCurrentDate(subMonths(newDate, 1))
          break
      }
    } else {
      switch (viewMode) {
        case "day":
          setCurrentDate(addDays(newDate, 1))
          break
        case "week":
          setCurrentDate(addWeeks(newDate, 1))
          break
        case "month":
          setCurrentDate(addMonths(newDate, 1))
          break
      }
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Compact Header with Controls */}
      <div className="border-b bg-card/50 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TimelineNavigationControls
            currentDate={currentDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNavigate={handleNavigate}
            onToday={handleToday}
          />
          
          <div className="flex items-center gap-2">
            <TimelineFilterBar
              grouping={grouping}
              onGroupingChange={setGrouping}
              selectedStatuses={selectedStatuses}
              onStatusesChange={setSelectedStatuses}
            />
            
            <HelpTip title="Guía del Timeline">
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  ⚠️ Vista de solo lectura
                </p>
                <p>
                  Visualiza la distribución temporal de tus ocurrencias. 
                  Para editar, completar o saltar ocurrencias, usa la vista de lista.
                </p>
                
                <p className="font-semibold mt-3">Navegación:</p>
                <p>
                  Flechas <strong>◄ ►</strong> para cambiar período · Botón <strong>"Hoy"</strong> para volver al presente
                </p>
                
                <p className="font-semibold mt-3">Vistas:</p>
                <p>
                  <strong>Día</strong> / <strong>Semana</strong> / <strong>Mes</strong>
                </p>
                
                <p className="font-semibold mt-3">Agrupación:</p>
                <p>
                  <strong>≡</strong> Ninguno <br/>
                  <strong>⧉</strong> Por Tarea <br/>
                  <strong>⧩</strong> Por Estado
                </p>
                
                <p className="font-semibold mt-3">Estados (colores del borde):</p>
                <p>
                  <strong className="text-amber-600 dark:text-amber-400">●</strong> Pendiente <br/> 
                  <strong className="text-blue-600 dark:text-blue-400">●</strong> En Progreso <br/> 
                  <strong className="text-emerald-600 dark:text-emerald-400">●</strong> Completada <br/> 
                  <strong className="text-slate-500 dark:text-slate-400">●</strong> Saltada
                </p>
                
                <p className="font-semibold mt-3">Fecha Límite:</p>
                <p>
                  <strong className="text-red-600 dark:text-red-400">Borde rojo</strong> = vencida <br/>
                  <strong className="text-orange-600 dark:text-orange-400">Borde naranja</strong> = vence pronto (≤3 días)
                </p>
              </div>
            </HelpTip>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${startDate.toISOString()}-${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <TimelineDateGrid
              dateRange={dateRange}
              occurrences={filteredOccurrences}
              groupedOccurrences={groupedOccurrences}
              grouping={grouping}
              viewMode={viewMode}
              onOccurrenceClick={onOccurrenceClick}
              onCompleteOccurrence={onCompleteOccurrence}
              onSkipOccurrence={onSkipOccurrence}
              onEditOccurrence={onEditOccurrence}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Compact Footer with stats and color legend */}
      <div className="border-t bg-card/50 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>
              {filteredOccurrences.length} ocurrencia{filteredOccurrences.length !== 1 ? "s" : ""}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {filteredOccurrences.filter(o => o.status === "Completed").length} completada{filteredOccurrences.filter(o => o.status === "Completed").length !== 1 ? "s" : ""}
            </span>
          </div>
          
          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground hidden lg:inline">Estados:</span>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500 dark:bg-amber-400" title="Pendiente"></div>
              <span className="text-muted-foreground hidden xl:inline">Pendiente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-blue-400" title="En Progreso"></div>
              <span className="text-muted-foreground hidden xl:inline">En Progreso</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" title="Completado"></div>
              <span className="text-muted-foreground hidden xl:inline">Completado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400" title="Saltado"></div>
              <span className="text-muted-foreground hidden xl:inline">Saltado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
