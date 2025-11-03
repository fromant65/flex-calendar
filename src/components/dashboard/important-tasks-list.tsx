"use client"

import type { OccurrenceWithTask } from "~/types"
import { Star, Calendar, Clock, Flag, AlertCircle } from "lucide-react"
import { cn } from "~/lib/utils"
import { TaskActionButtons } from "./task-action-buttons"
import { getLimitDateDisplay } from "~/lib/date-display-utils"
import { Badge } from "~/components/ui/badge"

interface ImportantTasksListProps {
  occurrences: OccurrenceWithTask[]
  onTaskClick?: (occurrence: OccurrenceWithTask) => void
  onCompleteTask?: (occurrence: OccurrenceWithTask) => void
  onSkipTask?: (occurrence: OccurrenceWithTask) => void
}

export function ImportantTasksList({ occurrences, onTaskClick, onCompleteTask, onSkipTask }: ImportantTasksListProps) {
  if (occurrences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
          <Star className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No hay tareas importantes</p>
        <p className="mt-1 text-xs text-muted-foreground">Importancia &gt; 5 aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {occurrences.map((occurrence, index) => {
        const task = occurrence.task
        const importance = task?.importance ?? 0
        const limitDisplay = getLimitDateDisplay(occurrence.limitDate)
        
        // Determine importance level for styling
        const importanceLevel = 
          importance >= 8 ? "high" : 
          importance >= 7 ? "medium" : 
          "normal"
        
        const importanceColors = {
          high: "border-primary/30 hover:border-primary/50",
          medium: "border-blue-500/30 hover:border-blue-500/50",
          normal: "border-border bg-card/50 hover:bg-card hover:border-primary/30",
        }

        const importanceIconColors = {
          high: "text-primary",
          medium: "text-blue-600 dark:text-blue-400",
          normal: "text-muted-foreground",
        }

        return (
          <div
            key={occurrence.id}
            className={cn(
              "group relative rounded-lg border p-3.5 transition-all hover:shadow-md",
              importanceColors[importanceLevel]
            )}
          >
            {/* Importance icon */}
            <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background border-2 border-current shadow-sm">
              <Star 
                className={cn("h-3.5 w-3.5", importanceIconColors[importanceLevel])} 
                fill="currentColor"
              />
            </div>

            {/* Task content */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 
                  className="font-semibold text-sm text-foreground line-clamp-1 flex-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onTaskClick?.(occurrence)}
                >
                  {task?.name || "Sin nombre"}
                </h3>
                <TaskActionButtons
                  occurrence={occurrence}
                  onComplete={onCompleteTask}
                  onSkip={onSkipTask}
                />
              </div>

              {task?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Metrics */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  <span className="font-medium">Importancia:</span>
                  <span className={cn("font-bold", importanceIconColors[importanceLevel])}>
                    {importance}
                  </span>
                </div>
                
                {/* Limit date display */}
                {occurrence.limitDate && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Límite: </span>
                    <span className={limitDisplay.color}>
                      {limitDisplay.shortText}
                    </span>
                  </div>
                )}

                {occurrence.targetTimeConsumption && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{occurrence.targetTimeConsumption}h</span>
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
