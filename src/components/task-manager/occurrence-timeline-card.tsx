"use client"

import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { TaskManagerOccurrence } from "./task-manager-timeline"
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
  SkipForward,
} from "lucide-react"
import { differenceInDays, isPast } from "date-fns"
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
import type { TaskType } from "~/types"

interface OccurrenceTimelineCardProps {
  occurrence: TaskManagerOccurrence
  onClick?: () => void
  onComplete?: () => void
  onSkip?: () => void
  onEdit?: () => void
  compact?: boolean
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: "text-amber-600 dark:text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  skipped: {
    icon: XCircle,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    border: "border-slate-200 dark:border-slate-700",
  },
} as const

type NormalizedStatus = keyof typeof statusConfig

const normalizeStatus = (status: string): NormalizedStatus => {
  const normalized = status.toLowerCase().replace(/\s+/g, "_")
  if (normalized === "in_progress") return "in_progress"
  if (normalized === "completed") return "completed"
  if (normalized === "skipped") return "skipped"
  return "pending"
}

const getTargetDate = (occurrence: TaskManagerOccurrence): Date | null =>
  occurrence.tentativeAt ?? occurrence.targetDate ?? null

const getLimitDate = (occurrence: TaskManagerOccurrence): Date | null =>
  occurrence.dueAt ?? occurrence.limitDate ?? null

const getTimeSpent = (occurrence: TaskManagerOccurrence): number =>
  occurrence.timeSpentMinutes ?? occurrence.timeConsumed ?? 0

const VALID_TASK_TYPES: readonly TaskType[] = ["Única", "Recurrente Finita", "Hábito", "Hábito +", "Fija Única", "Fija Repetitiva"]

const toTaskType = (value: string | null | undefined): TaskType | undefined => {
  if (!value) return undefined
  return (VALID_TASK_TYPES as readonly string[]).includes(value) ? (value as TaskType) : undefined
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
  const normalizedStatus = normalizeStatus(occurrence.status)
  const StatusIcon = statusConfig[normalizedStatus].icon
  const statusStyle = statusConfig[normalizedStatus]

  const taskTypeColors = getTaskTypeColors(toTaskType(occurrence.task.taskType))
  const targetDate = getTargetDate(occurrence)
  const limitDate = getLimitDate(occurrence)
  const daysToTarget = targetDate ? differenceInDays(targetDate, new Date()) : null
  const daysToLimit = limitDate ? differenceInDays(limitDate, new Date()) : null
  const isOverdue = Boolean(limitDate && isPast(limitDate) && normalizedStatus !== "completed" && normalizedStatus !== "skipped")
  const isApproachingDeadline = Boolean(daysToLimit !== null && daysToLimit <= 2 && daysToLimit >= 0 && normalizedStatus !== "completed" && normalizedStatus !== "skipped")

  const handleEdit = () => {
    setDropdownOpen(false)
    setTimeout(() => onEdit?.(), 0)
  }

  const handleComplete = () => {
    setDropdownOpen(false)
    setTimeout(() => onComplete?.(), 0)
  }

  const handleSkip = () => {
    setDropdownOpen(false)
    setTimeout(() => onSkip?.(), 0)
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
            e.preventDefault()
            onClick?.()
          }
        }}
        aria-label={`Ocurrencia de ${occurrence.task.name}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusStyle.color)} aria-hidden="true" />
            <span className="truncate text-sm font-medium">{occurrence.task.name}</span>
          </div>

          {targetDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`Fecha objetivo: ${formatDate(targetDate)}`}>{formatDate(targetDate)}</span>
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
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <StatusIcon className={cn("h-3.5 w-3.5 flex-shrink-0", statusStyle.color)} />
              <h3 className="cursor-pointer truncate text-sm font-semibold hover:underline" onClick={onClick}>
                {occurrence.task.name}
              </h3>
            </div>

            <Badge variant="outline" className={cn("text-xs h-5 px-1.5", taskTypeColors.text, taskTypeColors.border)}>
              {occurrence.task.taskType ?? "Única"}
            </Badge>
          </div>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100">
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
              {onComplete && normalizedStatus !== "completed" && (
                <DropdownMenuItem onClick={handleComplete} className="text-xs">
                  <Check className="mr-2 h-3.5 w-3.5" />
                  Completar
                </DropdownMenuItem>
              )}
              {onSkip && normalizedStatus !== "skipped" && normalizedStatus !== "completed" && (
                <DropdownMenuItem onClick={handleSkip} className="text-xs">
                  <SkipForward className="mr-2 h-3.5 w-3.5" />
                  Saltar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          {targetDate && (
            <div className="flex items-center gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-muted-foreground">Objetivo:</span>
              <span className="font-medium">{formatDate(targetDate)}</span>
              {daysToTarget !== null && (
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  {daysToTarget === 0 ? "Hoy" : daysToTarget > 0 ? `En ${daysToTarget}d` : `Hace ${Math.abs(daysToTarget)}d`}
                </Badge>
              )}
            </div>
          )}

          {limitDate && (
            <div className="flex items-center gap-1.5 text-xs">
              <AlertCircle
                className={cn(
                  "h-3.5 w-3.5",
                  isOverdue ? "text-red-600 dark:text-red-400" : isApproachingDeadline ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                )}
              />
              <span className="text-muted-foreground">Límite:</span>
              <span className={cn("font-medium", isOverdue && "text-red-600 dark:text-red-400", isApproachingDeadline && !isOverdue && "text-orange-600 dark:text-orange-400")}>
                {formatDate(limitDate)}
              </span>
              {daysToLimit !== null && (
                <Badge variant={isOverdue ? "destructive" : isApproachingDeadline ? "default" : "secondary"} className="text-xs h-4 px-1">
                  {daysToLimit === 0 ? "Hoy" : daysToLimit > 0 ? `En ${daysToLimit}d` : "Vencida"}
                </Badge>
              )}
            </div>
          )}

          {getTimeSpent(occurrence) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Tiempo: {getTimeSpent(occurrence)} min</span>
            </div>
          )}

          {normalizedStatus === "completed" && occurrence.completedAt && (
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span className="text-muted-foreground">Completada:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{formatCompletedDateTime(occurrence.completedAt)}</span>
            </div>
          )}
        </div>

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
