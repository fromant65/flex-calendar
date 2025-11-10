"use client"

import { CheckCircle2 } from "lucide-react"
import type { EventWithDetails } from "~/types"

export function CompletedPanel({ event }: { event: EventWithDetails }) {
  if (!event?.isCompleted) return null
  return (
    <div className="border-t border-border pt-4">
      <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2.5">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Este evento ha sido completado</p>
          {event.dedicatedTime && (
            <p className="text-xs text-muted-foreground mt-0.5">Tiempo dedicado: {event.dedicatedTime.toFixed(2)} horas</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompletedPanel
