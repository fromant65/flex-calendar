"use client"

import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { OccurrenceWithTask } from "~/types"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  Target,
  AlertCircle,
  MoreVertical,
  Edit,
  Check,
  SkipForward
} from "lucide-react"
import { format, differenceInDays, isPast, isFuture, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "~/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { getTaskTypeColors } from "~/lib/task-type-colors"
import { formatDateShort as formatDate, formatCompletedDateTime } from "~/lib/date-display-utils"

interface OccurrenceTimelineCardProps {
  occurrence: OccurrenceWithTask
  onClick?: () => void
  onComplete?: () => void
  onSkip?: () => void
  onEdit?: () => void
  compact?: boolean
}

const statusConfig = {
  Pending: { 
    label: "Pendiente", 
    icon: Circle, 
    color: "text-amber-600 dark:text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800"
  },
  "In Progress": { 
    label: "En Progreso", 
    icon: Clock, 
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800"
  },
  Completed: { 
    label: "Completado", 
    icon: CheckCircle2, 
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800"
  },
  Skipped: { 
    label: "Saltado", 
    icon: XCircle, 
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    border: "border-slate-200 dark:border-slate-700"
  },
}

export function OccurrenceTimelineCard({
  occurrence,
  onClick,
  onComplete,
  onSkip,
  onEdit,
  compact = false,
}: OccurrenceTimelineCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const StatusIcon = statusConfig[occurrence.status].icon
  const statusStyle = statusConfig[occurrence.status]
  
  const taskTypeColors = getTaskTypeColors(occurrence.task.taskType ?? "Única")

  // Calculate days until/since target and limit dates
  const daysToTarget = occurrence.targetDate 
    ? differenceInDays(occurrence.targetDate, new Date())
    : null
  
  const daysToLimit = occurrence.limitDate 
    ? differenceInDays(occurrence.limitDate, new Date())
    : null

  const isOverdue = occurrence.limitDate && isPast(occurrence.limitDate) && 
    occurrence.status !== "Completed" && occurrence.status !== "Skipped"

  const isApproachingDeadline = daysToLimit !== null && daysToLimit <= 2 && daysToLimit >= 0 &&
    occurrence.status !== "Completed" && occurrence.status !== "Skipped"

  // Handlers that close dropdown before executing action
  const handleEdit = () => {
    setDropdownOpen(false)
    // Small delay to ensure dropdown closes before opening dialog
    setTimeout(() => {
      onEdit?.()
    }, 0)
  }

  const handleComplete = () => {
    setDropdownOpen(false)
    setTimeout(() => {
      onComplete?.()
    }, 0)
  }

  const handleSkip = () => {
    setDropdownOpen(false)
    setTimeout(() => {
      onSkip?.()
    }, 0)
  }

  if (compact) {
    return (
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden border-l-4 p-2 transition-all hover:shadow-md",
          statusStyle.bg,
          statusStyle.border,
          isOverdue && "border-l-red-500 dark:border-l-red-400 bg-red-50 dark:bg-red-950/30"
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-label={`Ocurrencia de ${occurrence.task.name}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusStyle.color)} aria-hidden="true" />
            <span className="truncate text-sm font-medium">{occurrence.task.name}</span>
          </div>
          
          {occurrence.targetDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`Fecha objetivo: ${formatDate(occurrence.targetDate)}`}>
                {formatDate(occurrence.targetDate)}
              </span>
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            <span role="alert">Vencida</span>
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-l-4 transition-all hover:shadow-lg",
        statusStyle.bg,
        statusStyle.border,
        isOverdue && "border-l-red-500 dark:border-l-red-400 bg-red-50 dark:bg-red-950/30",
        isApproachingDeadline && !isOverdue && "border-l-orange-500 dark:border-l-orange-400 bg-orange-50 dark:bg-orange-950/30"
      )}
    >
      <div className="p-3">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <StatusIcon className={cn("h-3.5 w-3.5 flex-shrink-0", statusStyle.color)} />
              <h3 
                className="cursor-pointer truncate text-sm font-semibold hover:underline"
                onClick={onClick}
              >
                {occurrence.task.name}
              </h3>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs h-5 px-1.5", taskTypeColors.text, taskTypeColors.border)}
            >
              {occurrence.task.taskType}
            </Badge>
          </div>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <>
                  <DropdownMenuItem onClick={handleEdit} className="text-xs">
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onComplete && occurrence.status !== "Completed" && (
                <DropdownMenuItem onClick={handleComplete} className="text-xs">
                  <Check className="mr-2 h-3.5 w-3.5" />
                  Completar
                </DropdownMenuItem>
              )}
              {onSkip && occurrence.status !== "Skipped" && occurrence.status !== "Completed" && (
                <DropdownMenuItem onClick={handleSkip} className="text-xs">
                  <SkipForward className="mr-2 h-3.5 w-3.5" />
                  Saltar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Information */}
        <div className="space-y-1.5">
          {/* Target Date */}
          {occurrence.targetDate && (
            <div className="flex items-center gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-muted-foreground">Objetivo:</span>
              <span className="font-medium">{formatDate(occurrence.targetDate)}</span>
              {daysToTarget !== null && (
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  {daysToTarget === 0 
                    ? "Hoy" 
                    : daysToTarget > 0 
                    ? `En ${daysToTarget}d` 
                    : `Hace ${Math.abs(daysToTarget)}d`}
                </Badge>
              )}
            </div>
          )}

          {/* Limit Date */}
          {occurrence.limitDate && (
            <div className="flex items-center gap-1.5 text-xs">
              <AlertCircle className={cn(
                "h-3.5 w-3.5",
                isOverdue ? "text-red-600 dark:text-red-400" : 
                isApproachingDeadline ? "text-orange-600 dark:text-orange-400" : 
                "text-muted-foreground"
              )} />
              <span className="text-muted-foreground">Límite:</span>
              <span className={cn(
                "font-medium",
                isOverdue && "text-red-600 dark:text-red-400",
                isApproachingDeadline && !isOverdue && "text-orange-600 dark:text-orange-400"
              )}>
                {formatDate(occurrence.limitDate)}
              </span>
              {daysToLimit !== null && (
                <Badge 
                  variant={isOverdue ? "destructive" : isApproachingDeadline ? "default" : "secondary"}
                  className="text-xs h-4 px-1"
                >
                  {daysToLimit === 0 
                    ? "Hoy" 
                    : daysToLimit > 0 
                    ? `En ${daysToLimit}d` 
                    : `Vencida`}
                </Badge>
              )}
            </div>
          )}

          {/* Time Consumed */}
          {occurrence.timeConsumed !== null && occurrence.timeConsumed > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Tiempo: {occurrence.timeConsumed} min</span>
            </div>
          )}

          {/* Completion Date */}
          {occurrence.status === "Completed" && occurrence.completedAt && (
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span className="text-muted-foreground">Completada:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCompletedDateTime(occurrence.completedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Alert Messages */}
        {isOverdue && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-100 dark:bg-red-950/50 p-1.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-3.5 w-3.5" />
            Esta ocurrencia está vencida
          </div>
        )}

        {isApproachingDeadline && !isOverdue && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-orange-100 dark:bg-orange-950/50 p-1.5 text-xs text-orange-700 dark:text-orange-300">
            <AlertCircle className="h-3.5 w-3.5" />
            Fecha límite próxima
          </div>
        )}
      </div>
    </Card>
  )
}
