"use client"

import type { OccurrenceWithTask } from "~/types"
import { Calendar, Clock, Target, CheckCircle2 } from "lucide-react"
import { getLimitDateDisplay, formatDateShort } from "~/lib/date-display-utils"

export function OccurrenceInfo({ displayOccurrence }: { displayOccurrence?: OccurrenceWithTask | null }) {
  if (!displayOccurrence) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {displayOccurrence.targetDate && (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Objetivo</p>
            <p className="text-sm font-semibold text-foreground">
              {formatDateShort(displayOccurrence.targetDate)}
            </p>
          </div>
        </div>
      )}

      {displayOccurrence.limitDate && (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10">
            <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Límite</p>
            <p className={`text-sm font-semibold ${getLimitDateDisplay(displayOccurrence.limitDate).color}`}>
              {getLimitDateDisplay(displayOccurrence.limitDate).shortText}
            </p>
          </div>
        </div>
      )}

      {displayOccurrence.targetTimeConsumption && (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duración Objetivo</p>
            <p className="text-sm font-semibold text-foreground">{displayOccurrence.targetTimeConsumption}h</p>
          </div>
        </div>
      )}

      {displayOccurrence.timeConsumed !== undefined && displayOccurrence.timeConsumed !== null && (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/10">
            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tiempo Consumido</p>
            <p className="text-sm font-medium text-foreground">{displayOccurrence.timeConsumed.toFixed(1)} hs</p>
          </div>
        </div>
      )}

      {displayOccurrence.status && (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/30">
            <CheckCircle2 className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="text-sm font-semibold text-foreground">{displayOccurrence.status}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OccurrenceInfo
