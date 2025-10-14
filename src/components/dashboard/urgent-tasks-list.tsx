"use client"

import type { OccurrenceWithTask } from "~/lib/types"
import { AlertCircle, Calendar, Clock, Flag } from "lucide-react"
import { cn } from "~/lib/utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"

interface UrgentTasksListProps {
  occurrences: OccurrenceWithTask[]
  onTaskClick?: (occurrence: OccurrenceWithTask) => void
}

export function UrgentTasksList({ occurrences, onTaskClick }: UrgentTasksListProps) {
  if (occurrences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted/50 p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No hay tareas urgentes</p>
        <p className="mt-1 text-xs text-muted-foreground">¡Excelente trabajo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {occurrences.map((occurrence, index) => {
        const task = occurrence.task
        const urgency = occurrence.urgency ?? 0
        const importance = task?.importance ?? 0
        
        // Determine urgency level for styling
        const urgencyLevel = 
          urgency >= 8 ? "critical" : 
          urgency >= 6 ? "high" : 
          "medium"
        
        const urgencyColors = {
          critical: "border-red-500/50 bg-red-500/5 hover:bg-red-500/10",
          high: "border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10",
          medium: "border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10",
        }

        const urgencyTextColors = {
          critical: "text-red-600 dark:text-red-400",
          high: "text-orange-600 dark:text-orange-400",
          medium: "text-yellow-600 dark:text-yellow-400",
        }

        return (
          <div
            key={occurrence.id}
            onClick={() => onTaskClick?.(occurrence)}
            className={cn(
              "group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md",
              urgencyColors[urgencyLevel],
              getTaskTypeClassName(task?.taskType)
            )}
          >
            {/* Urgency badge */}
            <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-current shadow-sm">
              <span className={cn("text-xs font-bold", urgencyTextColors[urgencyLevel])}>
                {index + 1}
              </span>
            </div>

            {/* Task content */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground line-clamp-1 pr-8">
                  {task?.name || "Sin nombre"}
                </h3>
              </div>

              {task?.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Metrics */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="font-medium">Urgencia:</span>
                  <span className={cn("font-bold", urgencyTextColors[urgencyLevel])}>
                    {urgency.toFixed(1)}/10
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flag className="h-3.5 w-3.5" />
                  <span>Importancia:</span>
                  <span className="font-medium">{importance}/10</span>
                </div>

                {occurrence.targetTimeConsumption && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{occurrence.targetTimeConsumption}h</span>
                  </div>
                )}

                {occurrence.limitDate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(occurrence.limitDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
