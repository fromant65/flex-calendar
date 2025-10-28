"use client"

import { cn } from "~/lib/utils"
import { differenceInDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "motion/react"
import { Calendar, Flag } from "lucide-react"

interface DateRangeIndicatorProps {
  targetDate: Date | null
  limitDate: Date | null
  startDate?: Date
  className?: string
  showLabels?: boolean
}

/**
 * Visual indicator showing the range between target date and limit date
 * Displays a gradient bar with markers and clear labels
 */
export function DateRangeIndicator({
  targetDate,
  limitDate,
  startDate,
  className,
  showLabels = true,
}: DateRangeIndicatorProps) {
  if (!targetDate && !limitDate) return null

  const start = targetDate ?? startDate ?? new Date()
  const end = limitDate ?? targetDate ?? new Date()
  const today = new Date()

  // Calculate positions as percentages
  const totalDays = Math.max(differenceInDays(end, start), 1)
  const daysFromStart = differenceInDays(today, start)
  const progressPercentage = Math.min(Math.max((daysFromStart / totalDays) * 100, 0), 100)

  const isPastDeadline = limitDate && today > limitDate
  const isBeforeTarget = targetDate && today < targetDate

  return (
    <div className={cn("space-y-1.5", className)} role="img" aria-label="Línea de tiempo de la ocurrencia">
      {/* Header with title */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Línea de tiempo:</span>
      </div>
      
      {/* Date Labels */}
      {showLabels && (targetDate || limitDate) && (
        <div className="flex justify-between text-xs">
          {targetDate && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
              <div className="flex flex-col">
                <span className="font-medium text-blue-600 dark:text-blue-400">Objetivo</span>
                <span className="text-muted-foreground">
                  {format(targetDate, "dd MMM", { locale: es })}
                </span>
              </div>
            </div>
          )}
          {limitDate && (
            <div className="flex items-center gap-1">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isPastDeadline ? "bg-red-600 dark:bg-red-400" : "bg-orange-600 dark:bg-orange-400"
              )}></div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "font-medium",
                  isPastDeadline ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                )}>
                  Límite
                </span>
                <span className="text-muted-foreground">
                  {format(limitDate, "dd MMM", { locale: es })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
        {/* Gradient from target to limit */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            isPastDeadline
              ? "bg-gradient-to-r from-blue-500 dark:from-blue-400 via-orange-500 dark:via-orange-400 to-red-500 dark:to-red-400"
              : "bg-gradient-to-r from-blue-500 dark:from-blue-400 to-orange-500 dark:to-orange-400"
          )}
          style={{ width: "100%" }}
        />

        {/* Current position marker (today) */}
        {!isPastDeadline && !isBeforeTarget && (
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            title="Hoy"
          >
            <div className="flex flex-col items-center">
              <div className="h-5 w-0.5 rounded-full bg-white dark:bg-slate-900 shadow-lg ring-2 ring-slate-300 dark:ring-slate-600"></div>
              <span className="mt-0.5 text-[10px] font-semibold text-foreground">Hoy</span>
            </div>
          </motion.div>
        )}

        {/* Target marker */}
        {targetDate && (
          <div 
            className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 dark:bg-blue-500 shadow-sm"
            title={`Objetivo: ${format(targetDate, "dd MMM", { locale: es })}`}
          />
        )}

        {/* Limit marker */}
        {limitDate && (
          <div 
            className={cn(
              "absolute right-0 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
              isPastDeadline ? "bg-red-600 dark:bg-red-500" : "bg-orange-600 dark:bg-orange-500"
            )}
            title={`Límite: ${format(limitDate, "dd MMM", { locale: es })}`}
          />
        )}
      </div>

      {/* Status text */}
      {showLabels && (
        <div className="text-center text-xs text-muted-foreground">
          {isPastDeadline ? (
            <span className="font-medium text-red-600 dark:text-red-400">⚠️ Fecha límite pasada</span>
          ) : isBeforeTarget ? (
            <span>Faltan {differenceInDays(targetDate!, today)} día{differenceInDays(targetDate!, today) !== 1 ? 's' : ''} para el objetivo</span>
          ) : limitDate ? (
            <span>Quedan {differenceInDays(limitDate, today)} día{differenceInDays(limitDate, today) !== 1 ? 's' : ''} hasta el límite</span>
          ) : null}
        </div>
      )}
    </div>
  )
}
