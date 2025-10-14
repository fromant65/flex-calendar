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
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      if (onEventCompleted) onEventCompleted()
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
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      onOpenChange(false)
      if (onEventCompleted) onEventCompleted()
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
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      onOpenChange(false)
      setDedicatedTime("")
      setIsCompleting(false)
      if (onEventCompleted) {
        onEventCompleted()
      }
    },
    onError: (error) => {
      toast.error("Error al completar evento", {
        description: error.message || "Hubo un problema al completar el evento",
      })
      console.error("Error completing event:", error)
      setIsCompleting(false)
    }
  })

  const skipEventMutation = api.calendarEvent.update.useMutation({
    onSuccess: async () => {
      toast.info("Evento omitido", {
        description: "El evento ha sido marcado como omitido",
      })
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      onOpenChange(false)
      if (onEventCompleted) onEventCompleted()
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
      dedicatedTime: timeInHours
    })
  }

  // Check if event has already started
  const eventHasStarted = event ? new Date(event.start) <= new Date() : false

  if (!task && !event) return null

  const taskWithRecurrence = task && 'recurrence' in task ? task : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task?.name || "Event Details"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task?.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
              <p className="text-sm text-foreground">{task.description}</p>
            </div>
          )}

          {/* Task Type and Fixed Status */}
          <div className="flex gap-2 flex-wrap">
            {task?.taskType && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-1">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium text-foreground">{task.taskType}</p>
              </div>
            )}
            {task?.isFixed && (
              <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 px-3 py-1">
                <p className="text-xs text-blue-600 dark:text-blue-400">Tarea Fija</p>
                {task.fixedStartTime && task.fixedEndTime && (
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {task.fixedStartTime.substring(0, 5)} - {task.fixedEndTime.substring(0, 5)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recurrence Information */}
          {taskWithRecurrence?.recurrence && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <h4 className="text-sm font-medium text-foreground mb-2">Patrón de Recurrencia</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                {taskWithRecurrence.recurrence.interval && (
                  <p>Cada {taskWithRecurrence.recurrence.interval} días</p>
                )}
                {taskWithRecurrence.recurrence.daysOfWeek && taskWithRecurrence.recurrence.daysOfWeek.length > 0 && (
                  <p>Días: {taskWithRecurrence.recurrence.daysOfWeek.join(", ")}</p>
                )}
                {taskWithRecurrence.recurrence.daysOfMonth && taskWithRecurrence.recurrence.daysOfMonth.length > 0 && (
                  <p>Días del mes: {taskWithRecurrence.recurrence.daysOfMonth.join(", ")}</p>
                )}
                {taskWithRecurrence.recurrence.maxOccurrences && (
                  <p>Máximo de ocurrencias: {taskWithRecurrence.recurrence.maxOccurrences}</p>
                )}
                {taskWithRecurrence.recurrence.endDate && (
                  <p>Termina: {new Date(taskWithRecurrence.recurrence.endDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {task?.importance !== undefined && (
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Importancia</p>
                  <p className="text-sm font-medium text-foreground">{task.importance}/10</p>
                </div>
              </div>
            )}

            {displayOccurrence?.urgency !== undefined && displayOccurrence?.urgency !== null && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Urgencia</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.urgency.toFixed(1)}/10</p>
                </div>
              </div>
            )}

            {displayOccurrence?.targetTimeConsumption && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duración Objetivo</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.targetTimeConsumption} {displayOccurrence.targetTimeConsumption===1? "h":"hs"}</p>
                </div>
              </div>
            )}

            {displayOccurrence?.timeConsumed !== undefined && displayOccurrence?.timeConsumed !== null && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo Consumido</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.timeConsumed.toFixed(1)} hs</p>
                </div>
              </div>
            )}

            {displayOccurrence?.status && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.status}</p>
                </div>
              </div>
            )}

            {displayOccurrence?.targetDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Objetivo</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(displayOccurrence.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {displayOccurrence?.limitDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Límite</p>
                  <p className="text-sm font-medium text-destructive">
                    {new Date(displayOccurrence.limitDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {event && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Horario Programado</h4>
                {!event.isCompleted && !isEditing && !event.isFixed && (
                  <Button variant="ghost" size="sm" onClick={startEditMode}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {isEditing && (
                    <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={updateEventMutation.isPending}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSaveEdit} disabled={updateEventMutation.isPending}>
                      {updateEventMutation.isPending ? <LoadingSpinner size="xs" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>

              {event.isFixed && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Este evento tiene un horario fijo y no se puede modificar
                  </p>
                </div>
              )}

              {!isEditing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(event.start).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(event.start).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(event.finish).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="editDate">Date</Label>
                    <Input
                      id="editDate"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-input/5 dark:bg-input/30 text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="editStartTime">Start Time</Label>
                      <Input
                        id="editStartTime"
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="bg-input/5 dark:bg-input/30 text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEndTime">End Time</Label>
                      <Input
                        id="editEndTime"
                        type="time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="bg-input/5 dark:bg-input/30 text-foreground"
                      />
                    </div>
                  </div>
                </>
              )}

              {event.isFixed && !isEditing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <p className="text-sm">This event is fixed and cannot be rescheduled</p>
                </div>
              )}
            </div>
          )}

          {displayOccurrence && !event && (
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Occurrence Details</h4>

              {displayOccurrence.targetDate && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Target Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(displayOccurrence.targetDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {displayOccurrence.limitDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Limit Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(displayOccurrence.limitDate).toLocaleDateString("en-US", {
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
                <Button variant="destructive" className="w-full" size="sm" disabled={deleteEventMutation.isPending}>
                  {deleteEventMutation.isPending ? (
                    <>
                      <LoadingSpinner size="xs" />
                      <span className="ml-2">Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Event
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this event? This action cannot be undone. 
                    {event.associatedOccurrenceId && " The associated occurrence will be recovered and available for rescheduling."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEvent}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Info message for fixed tasks */}
        {event && event.isFixed && !event.isCompleted && !isEditing && (
          <div className="border-t border-border pt-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-3">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
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
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Evento aún no ha comenzado
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
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

              <div className="space-y-2">
                <Label htmlFor="dedicatedTime" className="text-sm font-medium">
                  Dedicated Time (hours)
                </Label>
                <Input
                  id="dedicatedTime"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g., 2.5"
                  value={dedicatedTime}
                  onChange={(e) => setDedicatedTime(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use scheduled duration (
                  {((event.finish.getTime() - event.start.getTime()) / (1000 * 60 * 60)).toFixed(2)} hours)
                </p>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="default" className="flex-1" disabled={skipEventMutation.isPending}>
                      {skipEventMutation.isPending ? (
                        <>
                          <LoadingSpinner size="xs" />
                          <span className="ml-2">Saltando...</span>
                        </>
                      ) : (
                        "Skip"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Skip event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to skip this scheduled event? The occurrence will be marked as Skipped.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (!event?.id) return
                          // mark event as skipped and associated occurrence as Skipped
                          skipEventMutation.mutate({ id: event.id, data: { isCompleted: false } })
                        }}
                      >
                        Skip
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex-1" 
                      disabled={completeEventMutation.isPending || !eventHasStarted}
                    >
                      {completeEventMutation.isPending ? (
                        <>
                          <LoadingSpinner size="xs" />
                          <span className="ml-2">Completando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="ml-2">Mark as Completed</span>
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Complete event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to mark this event as completed? This will update the occurrence and task lifecycle.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCompleteEvent()}>
                        Complete
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
            <div className="flex items-center gap-2 text-[color:var(--success)] dark:text-[color:var(--success-foreground)]">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">This event has been completed</p>
            </div>
            {event.dedicatedTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Time dedicated: {event.dedicatedTime.toFixed(2)} hours
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
