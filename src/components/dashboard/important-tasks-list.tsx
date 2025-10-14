"use client"

import type { OccurrenceWithTask } from "~/lib/types"
import { Star, Calendar, Clock, Flag, AlertCircle } from "lucide-react"
import { cn } from "~/lib/utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"

interface ImportantTasksListProps {
  occurrences: OccurrenceWithTask[]
  onTaskClick?: (occurrence: OccurrenceWithTask) => void
}

export function ImportantTasksList({ occurrences, onTaskClick }: ImportantTasksListProps) {
  if (occurrences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted/50 p-4">
          <Star className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No hay tareas importantes</p>
        <p className="mt-1 text-xs text-muted-foreground">Las tareas con importancia &gt; 5 aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {occurrences.map((occurrence, index) => {
        const task = occurrence.task
        const urgency = occurrence.urgency ?? 0
        const importance = task?.importance ?? 0
        
        // Determine importance level for styling
        const importanceLevel = 
          importance >= 8 ? "high" : 
          importance >= 7 ? "medium" : 
          "normal"
        
        const importanceColors = {
          high: "border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10",
          medium: "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10",
          normal: "border-primary/30 bg-primary/5 hover:bg-primary/10",
        }

        const importanceIconColors = {
          high: "text-purple-600 dark:text-purple-400",
          medium: "text-blue-600 dark:text-blue-400",
          normal: "text-primary",
        }

        return (
          <div
            key={occurrence.id}
            onClick={() => onTaskClick?.(occurrence)}
            className={cn(
              "group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md",
              importanceColors[importanceLevel],
              getTaskTypeClassName(task?.taskType)
            )}
          >
            {/* Importance icon */}
            <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-current shadow-sm">
              <Star 
                className={cn("h-4 w-4", importanceIconColors[importanceLevel])} 
                fill="currentColor"
              />
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
                  <Flag className="h-3.5 w-3.5" />
                  <span className="font-medium">Importancia:</span>
                  <span className={cn("font-bold", importanceIconColors[importanceLevel])}>
                    {importance}/10
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Urgencia:</span>
                  <span className="font-medium">{urgency.toFixed(1)}/10</span>
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
