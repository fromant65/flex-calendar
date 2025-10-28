"use client"

import { useMemo } from "react"
import type { OccurrenceWithTask } from "~/types"
import type { TimelineViewMode, TimelineGrouping } from "./task-manager-timeline"
import { OccurrenceTimelineCard } from "./occurrence-timeline-card"
import { format, isSameDay, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "~/lib/utils"
import { motion } from "motion/react"
import { Calendar, Layers } from "lucide-react"

interface TimelineDateGridProps {
  dateRange: Date[]
  occurrences: OccurrenceWithTask[]
  groupedOccurrences: Map<string, OccurrenceWithTask[]>
  grouping: TimelineGrouping
  viewMode: TimelineViewMode
  onOccurrenceClick?: (occurrence: OccurrenceWithTask) => void
  onCompleteOccurrence?: (occurrenceId: number) => void
  onSkipOccurrence?: (occurrenceId: number) => void
  onEditOccurrence?: (occurrence: OccurrenceWithTask) => void
}

export function TimelineDateGrid({
  dateRange,
  occurrences,
  groupedOccurrences,
  grouping,
  viewMode,
  onOccurrenceClick,
  onCompleteOccurrence,
  onSkipOccurrence,
  onEditOccurrence,
}: TimelineDateGridProps) {
  
  // Organize occurrences by date (using targetDate primarily, fallback to limitDate or startDate)
  const occurrencesByDate = useMemo(() => {
    const byDate = new Map<string, OccurrenceWithTask[]>()
    
    occurrences.forEach((occ) => {
      // Use targetDate if available, otherwise limitDate, otherwise startDate
      const primaryDate = occ.targetDate ?? occ.limitDate ?? occ.startDate
      const dateKey = format(primaryDate, "yyyy-MM-dd")
      
      const existing = byDate.get(dateKey) ?? []
      byDate.set(dateKey, [...existing, occ])
    })
    
    return byDate
  }, [occurrences])

  if (grouping === "none") {
    // Grid layout by date
    return (
      <div className={cn(
        "grid gap-3",
        viewMode === "day" ? "grid-cols-1" : 
        viewMode === "week" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" :
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {dateRange.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd")
          const dayOccurrences = occurrencesByDate.get(dateKey) ?? []
          
          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-lg border bg-card p-2.5",
                isToday(date) && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {/* Date Header */}
              <div className="mb-2 flex items-center justify-between border-b pb-1.5">
                <div>
                  <div className={cn(
                    "text-xs font-semibold",
                    isToday(date) && "text-primary"
                  )}>
                    {format(date, "EEEE", { locale: es })}
                  </div>
                  <div className={cn(
                    "text-xl font-bold leading-none",
                    isToday(date) && "text-primary"
                  )}>
                    {format(date, "d", { locale: es })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, "MMM yyyy", { locale: es })}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-xs font-medium text-muted-foreground">
                    {dayOccurrences.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dayOccurrences.length === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>

              {/* Occurrences for this date */}
              <div className="space-y-2">
                {dayOccurrences.length > 0 ? (
                  dayOccurrences.map((occ) => (
                    <OccurrenceTimelineCard
                      key={occ.id}
                      occurrence={occ}
                      onClick={() => onOccurrenceClick?.(occ)}
                      onComplete={() => onCompleteOccurrence?.(occ.id)}
                      onSkip={() => onSkipOccurrence?.(occ.id)}
                      onEdit={() => onEditOccurrence?.(occ)}
                      compact={viewMode === "month"}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Calendar className="mb-1.5 h-6 w-6 opacity-50" />
                    <span className="text-xs">Sin ocurrencias</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Grouped layout (by task or status)
  return (
    <div className="space-y-4">
      {Array.from(groupedOccurrences.entries()).map(([groupKey, groupOccs]) => {
        const groupLabel = grouping === "task" 
          ? groupOccs[0]?.task.name ?? "Sin tarea"
          : groupOccs[0]?.status ?? "Sin estado"

        return (
          <motion.div
            key={groupKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border bg-card"
          >
            {/* Group Header */}
            <div className="flex items-center gap-2 border-b bg-muted/50 p-2.5">
              <Layers className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{groupLabel}</h3>
                <p className="text-xs text-muted-foreground">
                  {groupOccs.length} ocurrencia{groupOccs.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Group Content - Grid of dates with occurrences */}
            <div className="p-3">
              <div className={cn(
                "grid gap-3",
                viewMode === "day" ? "grid-cols-1" : 
                viewMode === "week" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              )}>
                {/* Organize group occurrences by date */}
                {Array.from(
                  groupOccs.reduce((acc, occ) => {
                    const primaryDate = occ.targetDate ?? occ.limitDate ?? occ.startDate
                    const dateKey = format(primaryDate, "yyyy-MM-dd")
                    const existing = acc.get(dateKey) ?? []
                    acc.set(dateKey, [...existing, occ])
                    return acc
                  }, new Map<string, OccurrenceWithTask[]>())
                ).map(([dateKey, dateOccs]) => {
                  const date = new Date(dateKey)
                  
                  return (
                    <div
                      key={dateKey}
                      className={cn(
                        "rounded-md border bg-background p-2",
                        isToday(date) && "ring-2 ring-primary/50"
                      )}
                    >
                      {/* Mini Date Header */}
                      <div className="mb-1.5 flex items-center justify-between border-b pb-1.5">
                        <div className="text-xs">
                          <div className={cn(
                            "font-medium",
                            isToday(date) && "text-primary"
                          )}>
                            {format(date, "EEE d MMM", { locale: es })}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dateOccs.length}
                        </div>
                      </div>

                      {/* Occurrences */}
                      <div className="space-y-1.5">
                        {dateOccs.map((occ) => (
                          <OccurrenceTimelineCard
                            key={occ.id}
                            occurrence={occ}
                            onClick={() => onOccurrenceClick?.(occ)}
                            onComplete={() => onCompleteOccurrence?.(occ.id)}
                            onSkip={() => onSkipOccurrence?.(occ.id)}
                            onEdit={() => onEditOccurrence?.(occ)}
                            compact={viewMode === "month"}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )
      })}

      {groupedOccurrences.size === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-muted-foreground">
          <Calendar className="mb-3 h-12 w-12 opacity-50" />
          <h3 className="mb-1 text-base font-semibold">No hay ocurrencias</h3>
          <p className="text-xs">No se encontraron ocurrencias para los filtros seleccionados</p>
        </div>
      )}
    </div>
  )
}
