"use client"

import type { OccurrenceWithTask, TaskWithRecurrence } from "~/types"
import { Calendar, Clock, Target, CheckCircle2, Flag } from "lucide-react"
import { getLimitDateDisplay } from "~/lib/date-display-utils"

export function OccurrenceInfo({ displayOccurrence, task }: { displayOccurrence?: OccurrenceWithTask | null; task?: Partial<TaskWithRecurrence> | null }) {
  const taskWithRecurrence = task && 'recurrence' in task ? task : null

  if (!displayOccurrence && !task) return null

  return (
    <>
      {/* Recurrence block */}
      {taskWithRecurrence?.recurrence && (
        <div className="rounded-lg border border-border bg-muted/20 p-3.5">
          <h4 className="text-sm font-semibold text-foreground mb-2.5">Patrón de Recurrencia</h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {taskWithRecurrence.recurrence.interval && <p>• Cada {taskWithRecurrence.recurrence.interval} días</p>}
            {taskWithRecurrence.recurrence.daysOfWeek && taskWithRecurrence.recurrence.daysOfWeek.length > 0 && (
              <p>• Días: {taskWithRecurrence.recurrence.daysOfWeek.join(", ")}</p>
            )}
            {taskWithRecurrence.recurrence.daysOfMonth && taskWithRecurrence.recurrence.daysOfMonth.length > 0 && (
              <p>• Días del mes: {taskWithRecurrence.recurrence.daysOfMonth.join(", ")}</p>
            )}
            {taskWithRecurrence.recurrence.maxOccurrences && <p>• Máximo de ocurrencias: {taskWithRecurrence.recurrence.maxOccurrences}</p>}
            {taskWithRecurrence.recurrence.endDate && <p>• Termina: {new Date(taskWithRecurrence.recurrence.endDate).toLocaleDateString()}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {task?.importance !== undefined && (
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Flag className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Importancia</p>
              <p className="text-sm font-semibold text-foreground">{task.importance}/10</p>
            </div>
          </div>
        )}

        {displayOccurrence?.limitDate && (
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

        {displayOccurrence?.targetTimeConsumption && (
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

        {displayOccurrence?.timeConsumed !== undefined && displayOccurrence?.timeConsumed !== null && (
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

        {displayOccurrence?.status && (
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

        {displayOccurrence?.targetDate && (
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha Objetivo</p>
              <p className="text-sm font-semibold text-foreground">{new Date(displayOccurrence.targetDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        )}

        {displayOccurrence?.limitDate && (
          <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/20">
              <Calendar className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha Límite</p>
              <p className="text-sm font-semibold text-destructive">{new Date(displayOccurrence.limitDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default OccurrenceInfo
