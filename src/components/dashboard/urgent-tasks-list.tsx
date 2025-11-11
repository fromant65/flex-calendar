"use client"

import { motion } from "framer-motion"
import type { OccurrenceWithTask } from "~/types"
import { AlertCircle, Calendar, Clock, Flag } from "lucide-react"
import { cn } from "~/lib/utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"
import { TaskActionButtons } from "./task-action-buttons"
import { getLimitDateDisplay } from "~/lib/date-display-utils"
import { Badge } from "~/components/ui/badge"

interface UrgentTasksListProps {
  occurrences: OccurrenceWithTask[]
  onTaskClick?: (occurrence: OccurrenceWithTask) => void
  onCompleteTask?: (occurrence: OccurrenceWithTask) => void
  onSkipTask?: (occurrence: OccurrenceWithTask) => void
}

export function UrgentTasksList({ occurrences, onTaskClick, onCompleteTask, onSkipTask }: UrgentTasksListProps) {
  if (occurrences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No hay tareas urgentes</p>
        <p className="mt-1 text-xs text-muted-foreground">¡Excelente trabajo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {occurrences.map((occurrence, index) => {
        const task = occurrence.task
        const importance = task?.importance ?? 0
        const limitDisplay = getLimitDateDisplay(occurrence.limitDate)
        
        // Determine urgency level based on limit date proximity
        const urgencyLevel = 
          limitDisplay.badgeText === "Vencida" || limitDisplay.badgeText === "Hoy" ? "critical" : 
          limitDisplay.badgeText === "Mañana" || limitDisplay.badgeText === "Próxima" ? "high" : 
          "medium"
        
        const urgencyColors = {
          critical: "border-destructive/30 hover:border-destructive/50",
          high: "border-orange-500/30 hover:border-orange-500/50",
          medium: "border-yellow-500/30 hover:border-yellow-500/50",
        }

        const urgencyTextColors = {
          critical: "text-destructive",
          high: "text-orange-600 dark:text-orange-400",
          medium: "text-yellow-600 dark:text-yellow-400",
        }

        return (
          <motion.div
            key={occurrence.id}
            className={cn(
              "group relative rounded-lg border p-3.5 transition-all hover:shadow-md",
              urgencyColors[urgencyLevel]
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {/* Urgency badge */}
            <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background border-2 border-current shadow-sm">
              <span className={cn("text-xs font-bold", urgencyTextColors[urgencyLevel])}>
                {index + 1}
              </span>
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
                {/* Limit date display */}
                {occurrence.limitDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">Límite:</span>
                    <span className={cn("font-bold", limitDisplay.color)}>
                      {limitDisplay.shortText}
                    </span>
                    {limitDisplay.badgeText && (
                      <Badge 
                        variant={limitDisplay.badgeText === "Vencida" ? "destructive" : "outline"}
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          limitDisplay.badgeText !== "Vencida" && "border-orange-500 text-orange-700 dark:text-orange-400"
                        )}
                      >
                        {limitDisplay.badgeText}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flag className="h-3 w-3" />
                  <span>Importancia: {importance}</span>
                </div>

                {occurrence.targetTimeConsumption && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{occurrence.targetTimeConsumption}h</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
