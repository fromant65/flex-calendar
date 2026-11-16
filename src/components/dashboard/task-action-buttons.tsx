"use client"

import { CheckCircle2, SkipForward } from "lucide-react"
import { Button } from "~/components/ui/button"
import type { CalendarOccurrenceLike } from "~/types/v2-ui"

interface TaskActionButtonsProps {
  occurrence: CalendarOccurrenceLike
  onComplete?: (occurrence: CalendarOccurrenceLike) => void
  onSkip?: (occurrence: CalendarOccurrenceLike) => void
}

export function TaskActionButtons({ occurrence, onComplete, onSkip }: TaskActionButtonsProps) {
  const normalizedStatus = occurrence.status.toLowerCase().replace(/\s+/g, "_")

  // Don't show buttons if task is already completed or skipped
  if (normalizedStatus === "completed" || normalizedStatus === "skipped") {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      {onSkip && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 cursor-pointer hover:bg-gray-500/10 hover:text-gray-600 dark:hover:text-gray-400"
          onClick={(e) => {
            e.stopPropagation()
            onSkip(occurrence)
          }}
          title="Saltar tarea"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      )}
      {onComplete && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 cursor-pointer hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
          onClick={(e) => {
            e.stopPropagation()
            onComplete(occurrence)
          }}
          title="Completar tarea"
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
