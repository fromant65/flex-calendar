"use client"

import type { EventWithDetails, OccurrenceWithTask, TaskWithRecurrence } from "~/types"
import { Calendar, Clock, Flag, Lock, Target, CheckCircle2, Edit2, Trash2, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useState } from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"

interface TaskDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Partial<TaskWithRecurrence> | null
  occurrence?: OccurrenceWithTask | null
  event?: EventWithDetails | null
  onEventCompleted?: () => void
}

export function TaskDetailsModal({ open, onOpenChange, task: taskProp, occurrence, event, onEventCompleted }: TaskDetailsModalProps) {
  const task = taskProp || occurrence?.task || event?.occurrence?.task
  const displayOccurrence = occurrence || event?.occurrence
  const utils = api.useUtils()

  const [dedicatedTime, setDedicatedTime] = useState<string>("")
  const [isCompleting, setIsCompleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [completeOccurrence, setCompleteOccurrence] = useState(false)
  const [skipOccurrence, setSkipOccurrence] = useState(false)
  
  // Edit mode states
  const [editDate, setEditDate] = useState<string>("")
  const [editStartTime, setEditStartTime] = useState<string>("")
  const [editEndTime, setEditEndTime] = useState<string>("")

  // Initialize edit fields when entering edit mode
  const startEditMode = () => {
    if (!event) return
    const start = new Date(event.start)
    const end = new Date(event.finish)
    
    setEditDate(start.toISOString().split('T')[0] ?? "")
    setEditStartTime(`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`)
    setEditEndTime(`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditDate("")
    setEditStartTime("")
    setEditEndTime("")
  }

  const updateEventMutation = api.calendarEvent.update.useMutation({
    onSuccess: async () => {
      toast.success("Evento actualizado", {
        description: "Los cambios han sido guardados correctamente",
      })
      setIsEditing(false)
      // If parent provided onEventCompleted, delegate invalidation to it (avoid double invalidation)
      if (onEventCompleted) {
        onEventCompleted()
      } else {
        // Invalidate queries to refresh the UI
        await utils.calendarEvent.getMyEventsWithDetails.invalidate()
        await utils.occurrence.invalidate() // Invalidate all occurrence queries
      }
    },
    onError: (error) => {
      toast.error("Error al actualizar evento", {
        description: error.message || "Hubo un problema al actualizar el evento",
      })
      console.error("Error updating event", error)
    },
  })

  const deleteEventMutation = api.calendarEvent.delete.useMutation({
    onSuccess: async () => {
      toast.success("Evento eliminado", {
        description: "El evento ha sido eliminado de tu calendario",
      })
      // Delegate invalidation to parent when possible
      if (onEventCompleted) {
        onEventCompleted()
      } else {
        await utils.calendarEvent.getMyEventsWithDetails.invalidate()
        await utils.occurrence.invalidate()
      }
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error("Error al eliminar evento", {
        description: error.message || "Hubo un problema al eliminar el evento",
      })
      console.error("Error deleting event", error)
    },
  })

  const completeEventMutation = api.calendarEvent.complete.useMutation({
    onSuccess: async () => {
      toast.success("¡Evento completado!", {
        description: dedicatedTime 
          ? `Registraste ${dedicatedTime} hora(s) de dedicación` 
          : "El evento ha sido marcado como completado",
      })
      // Delegate invalidation to parent when possible
      if (onEventCompleted) {
        onEventCompleted()
      } else {
        await utils.calendarEvent.getMyEventsWithDetails.invalidate()
        await utils.occurrence.invalidate()
      }
      onOpenChange(false)
      setDedicatedTime("")
      setCompleteOccurrence(false)
      setIsCompleting(false)
    },
    onError: (error) => {
      toast.error("Error al completar evento", {
        description: error.message || "Hubo un problema al completar el evento",
      })
      console.error("Error completing event:", error)
      setIsCompleting(false)
    }
  })

  const skipEventMutation = api.calendarEvent.skip.useMutation({
    onSuccess: async () => {
      toast.info("Evento omitido", {
        description: "El evento ha sido marcado como omitido",
      })
      // Delegate invalidation to parent when possible
      if (onEventCompleted) {
        onEventCompleted()
      } else {
        await utils.calendarEvent.getMyEventsWithDetails.invalidate()
        await utils.occurrence.invalidate()
      }
      onOpenChange(false)
      setSkipOccurrence(false)
    },
    onError: (error) => {
      toast.error("Error al omitir evento", {
        description: error.message || "Hubo un problema al omitir el evento",
      })
      console.error("Error skipping event", error)
    },
  })

  const handleSaveEdit = () => {
    if (!event?.id || !editDate || !editStartTime || !editEndTime) return

    const [year, month, day] = editDate.split('-').map(Number)
    const [startHour, startMinute] = editStartTime.split(':').map(Number)
    const [endHour, endMinute] = editEndTime.split(':').map(Number)

    const start = new Date(year!, month! - 1, day, startHour, startMinute)
    const finish = new Date(year!, month! - 1, day, endHour, endMinute)

    updateEventMutation.mutate({
      id: event.id,
      data: { start, finish }
    })
  }

  const handleDeleteEvent = () => {
    if (!event?.id) return
    // Close the modal immediately so the UI responds promptly.
    // The mutation still runs and will invalidate queries on success.
    onOpenChange(false)
    deleteEventMutation.mutate({ id: event.id })
  }

  const handleCompleteEvent = () => {
    if (!event?.id) return

    const timeInHours = dedicatedTime ? parseFloat(dedicatedTime) : undefined

    completeEventMutation.mutate({
      id: event.id,
      dedicatedTime: timeInHours,
      completeOccurrence: completeOccurrence
    })
  }

  const handleSkipEvent = () => {
    if (!event?.id) return
    skipEventMutation.mutate({ 
      id: event.id,
      skipOccurrence: skipOccurrence
    })
  }

  // Check if event has already started
  const eventHasStarted = event ? new Date(event.start) <= new Date() : false

  if (!task && !event) return null

  const taskWithRecurrence = task && 'recurrence' in task ? task : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-border bg-card">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">{task?.name || "Detalles del Evento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {task?.description && (
            <div className="rounded-lg bg-muted/30 p-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Descripción</h4>
              <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Task Type and Fixed Status */}
          <div className="flex gap-2 flex-wrap">
            {task?.taskType && (
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5">Tipo</p>
                <p className="text-sm font-semibold text-foreground">{task.taskType}</p>
              </div>
            )}
            {task?.isFixed && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                <p className="text-xs text-primary font-medium">Tarea Fija</p>
                {task.fixedStartTime && task.fixedEndTime && (
                  <p className="text-sm font-semibold text-primary">
                    {task.fixedStartTime.substring(0, 5)} - {task.fixedEndTime.substring(0, 5)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recurrence Information */}
          {taskWithRecurrence?.recurrence && (
            <div className="rounded-lg border border-border bg-muted/20 p-3.5">
              <h4 className="text-sm font-semibold text-foreground mb-2.5">Patrón de Recurrencia</h4>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {taskWithRecurrence.recurrence.interval && (
                  <p>• Cada {taskWithRecurrence.recurrence.interval} días</p>
                )}
                {taskWithRecurrence.recurrence.daysOfWeek && taskWithRecurrence.recurrence.daysOfWeek.length > 0 && (
                  <p>• Días: {taskWithRecurrence.recurrence.daysOfWeek.join(", ")}</p>
                )}
                {taskWithRecurrence.recurrence.daysOfMonth && taskWithRecurrence.recurrence.daysOfMonth.length > 0 && (
                  <p>• Días del mes: {taskWithRecurrence.recurrence.daysOfMonth.join(", ")}</p>
                )}
                {taskWithRecurrence.recurrence.maxOccurrences && (
                  <p>• Máximo de ocurrencias: {taskWithRecurrence.recurrence.maxOccurrences}</p>
                )}
                {taskWithRecurrence.recurrence.endDate && (
                  <p>• Termina: {new Date(taskWithRecurrence.recurrence.endDate).toLocaleDateString()}</p>
                )}
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

            {displayOccurrence?.urgency !== undefined && displayOccurrence?.urgency !== null && (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10">
                  <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Urgencia</p>
                  <p className="text-sm font-semibold text-foreground">{displayOccurrence.urgency.toFixed(1)}/10</p>
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
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(displayOccurrence.targetDate).toLocaleDateString()}
                  </p>
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
                  <p className="text-sm font-semibold text-destructive">
                    {new Date(displayOccurrence.limitDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {event && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Horario Programado</h4>
                {!event.isCompleted && !isEditing && !event.isFixed && (
                  <Button variant="ghost" size="sm" onClick={startEditMode} className="hover:bg-accent">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {isEditing && (
                    <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={updateEventMutation.isPending} className="hover:bg-accent">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSaveEdit} disabled={updateEventMutation.isPending} className="hover:bg-accent">
                      {updateEventMutation.isPending ? <LoadingSpinner size="xs" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                )}
              </div>

              {/* If the task is fixed, we show a single informative message later; remove inline duplicate. */}

              {!isEditing ? (
                <>
                  <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(event.start).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Horario</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(event.start).toLocaleTimeString("es-ES", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(event.finish).toLocaleTimeString("es-ES", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="editDate" className="text-xs font-medium text-muted-foreground">Fecha</Label>
                    <Input
                      id="editDate"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-muted/20 border-border text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="editStartTime" className="text-xs font-medium text-muted-foreground">Hora de Inicio</Label>
                      <Input
                        id="editStartTime"
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="bg-muted/20 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="editEndTime" className="text-xs font-medium text-muted-foreground">Hora de Fin</Label>
                      <Input
                        id="editEndTime"
                        type="time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="bg-muted/20 border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Event context (optional) */}
              {!isEditing && event?.context && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Contexto</h4>
                  <p className="text-sm text-foreground leading-relaxed break-words">{event.context}</p>
                </div>
              )}

              {event.isFixed && !isEditing && (
                <div className="flex items-center gap-2 text-muted-foreground rounded-lg bg-muted/20 p-2.5">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">Este evento es fijo y no se puede reprogramar</p>
                </div>
              )}
            </div>
          )}

          {displayOccurrence && !event && (
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Detalles de la Ocurrencia</h4>

              {displayOccurrence.targetDate && (
                <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha Objetivo</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(displayOccurrence.targetDate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {displayOccurrence.limitDate && (
                <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 p-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/20">
                    <Calendar className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha Límite</p>
                    <p className="text-sm font-semibold text-destructive">
                      {new Date(displayOccurrence.limitDate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Event Button - show for non-completed events (not allowed for fixed tasks) */}
        {event && !event.isCompleted && !event.isFixed && !isEditing && (
          <div className="border-t border-border pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full hover:bg-destructive/90" size="sm" disabled={deleteEventMutation.isPending}>
                  {deleteEventMutation.isPending ? (
                    <>
                      <LoadingSpinner size="xs" />
                      <span className="ml-2">Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Eliminar Evento
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">¿Eliminar evento?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
                    {event.associatedOccurrenceId && " La ocurrencia asociada será recuperada y estará disponible para reprogramación."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:bg-accent">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Info message for fixed tasks */}
        {event && event.isFixed && !event.isCompleted && !isEditing && (
          <div className="border-t border-border pt-4">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground">
                  Los eventos de tareas fijas no se pueden eliminar. Usa "Skip" si no lo realizaste o "Complete" cuando lo termines.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Complete Event Section - only show for events that are not completed */}
        {event && !event.isCompleted && !isEditing && (
          <DialogFooter className="border-t border-border pt-4">
            <div className="w-full space-y-3">
              {/* Warning if event hasn't started yet */}
              {!eventHasStarted && (
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Evento aún no ha comenzado
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Solo puedes completar eventos que ya hayan iniciado. Este evento comienza el{" "}
                        {new Date(event.start).toLocaleString("es", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="dedicatedTime" className="text-xs font-medium text-muted-foreground">
                  Tiempo Dedicado (horas)
                </Label>
                <Input
                  id="dedicatedTime"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="ej., 2.5"
                  value={dedicatedTime}
                  onChange={(e) => setDedicatedTime(e.target.value)}
                  className="w-full bg-muted/20 border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Deja vacío para usar la duración programada (
                  {((event.finish.getTime() - event.start.getTime()) / (1000 * 60 * 60)).toFixed(2)} horas)
                </p>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="outline" size="default" className="flex-1 hover:bg-accent" disabled={skipEventMutation.isPending}>
                      {skipEventMutation.isPending ? (
                        <>
                          <LoadingSpinner size="xs" />
                          <span className="ml-2">Saltando...</span>
                        </>
                      ) : (
                        "Saltar"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-border bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Saltar evento</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        ¿Estás seguro de que deseas saltar este evento programado?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {event?.associatedOccurrenceId && !event.isFixed && (
                      <div className="flex items-center space-x-2 px-6">
                        <Checkbox
                          id="skipOccurrence"
                          checked={skipOccurrence}
                          onCheckedChange={(checked) => setSkipOccurrence(checked === true)}
                        />
                        <label
                          htmlFor="skipOccurrence"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                        >
                          También saltar la ocurrencia asociada
                        </label>
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSkipOccurrence(false)} className="hover:bg-accent">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSkipEvent} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Saltar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" 
                      disabled={completeEventMutation.isPending || !eventHasStarted}
                    >
                      {completeEventMutation.isPending ? (
                        <>
                          <LoadingSpinner size="xs" />
                          <span className="ml-2">Completando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="ml-2">Marcar como Completado</span>
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-border bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Completar evento</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        ¿Estás seguro de que deseas marcar este evento como completado?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {event?.associatedOccurrenceId && !event.isFixed && (
                      <div className="flex items-center space-x-2 px-6">
                        <Checkbox
                          id="completeOccurrence"
                          checked={completeOccurrence}
                          onCheckedChange={(checked) => setCompleteOccurrence(checked === true)}
                        />
                        <label
                          htmlFor="completeOccurrence"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                        >
                          También completar la ocurrencia asociada
                        </label>
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setCompleteOccurrence(false)} className="hover:bg-accent">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCompleteEvent} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Completar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </DialogFooter>
        )}

        {event && event.isCompleted && (
          <div className="border-t border-border pt-4">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Este evento ha sido completado</p>
                {event.dedicatedTime && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tiempo dedicado: {event.dedicatedTime.toFixed(2)} horas
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
