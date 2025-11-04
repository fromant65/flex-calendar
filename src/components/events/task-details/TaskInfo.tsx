"use client"

import type { TaskWithRecurrence } from "~/types"
import { Activity, Calendar, CheckCircle2, Clock, Flag, XCircle } from "lucide-react"

interface TaskInfoProps {
  task?: Partial<TaskWithRecurrence> | null
}

export function TaskInfo({ task }: TaskInfoProps) {
  if (!task) return null

  return (
    <div className="space-y-3">
      {/* Task Status, Type and Importance Row */}
      <div className="grid grid-cols-2 gap-3">
        {task.taskType && (
          <div className="flex items-center gap-2.5 rounded-lg bg-blue-500/10 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/20">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo de Tarea</p>
              <p className="text-sm font-semibold text-foreground">{task.taskType}</p>
            </div>
          </div>
        )}

        {task.importance !== undefined && (
          <div className="flex items-center gap-2.5 rounded-lg bg-amber-500/10 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/20">
              <Flag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Importancia</p>
              <p className="text-sm font-semibold text-foreground">{task.importance}/10</p>
            </div>
          </div>
        )}

        {task.isActive !== undefined && (
          <div className={`flex items-center gap-2.5 rounded-lg p-2.5 ${task.isActive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${task.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {task.isActive ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="text-sm font-semibold text-foreground">
                {task.isActive ? 'Activa' : 'Inactiva'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Task Times */}
      {task.isFixed && (task.fixedStartTime || task.fixedEndTime) && (
        <div className="flex items-center gap-2.5 rounded-lg bg-purple-500/10 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/20">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Horario Fijo</p>
            <p className="text-sm font-semibold text-foreground">
              {task.fixedStartTime && task.fixedEndTime 
                ? `${task.fixedStartTime.slice(0, 5)} - ${task.fixedEndTime.slice(0, 5)}`
                : task.fixedStartTime 
                  ? `Inicio: ${task.fixedStartTime.slice(0, 5)}`
                  : `Fin: ${task.fixedEndTime?.slice(0, 5)}`
              }
            </p>
          </div>
        </div>
      )}

      {/* Creation and Update Dates */}
      {(task.createdAt || task.updatedAt || task.completedAt) && (
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Fechas</h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {task.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Creada: {new Date(task.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {task.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Actualizada: {new Date(task.updatedAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {task.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">
                  Completada: {new Date(task.completedAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recurrence Details */}
      {task.recurrence && (
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Detalles de Recurrencia</h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {task.recurrence.interval && (
              <p>• Intervalo: cada {task.recurrence.interval} día{task.recurrence.interval > 1 ? 's' : ''}</p>
            )}
            {task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0 && (
              <p>• Días de la semana: {task.recurrence.daysOfWeek.join(", ")}</p>
            )}
            {task.recurrence.daysOfMonth && task.recurrence.daysOfMonth.length > 0 && (
              <p>• Días del mes: {task.recurrence.daysOfMonth.join(", ")}</p>
            )}
            {task.recurrence.maxOccurrences !== null && task.recurrence.maxOccurrences !== undefined && (
              <p>• Máximo de ocurrencias: {task.recurrence.maxOccurrences}</p>
            )}
            {task.recurrence.completedOccurrences !== null && task.recurrence.completedOccurrences !== undefined && (
              <p>• Ocurrencias completadas: {task.recurrence.completedOccurrences}</p>
            )}
            {task.recurrence.endDate && (
              <p>• Fecha de finalización: {new Date(task.recurrence.endDate).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            )}
            {task.recurrence.lastPeriodStart && (
              <p>• Último período iniciado: {new Date(task.recurrence.lastPeriodStart).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskInfo
