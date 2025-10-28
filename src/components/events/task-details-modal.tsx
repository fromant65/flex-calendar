"use client"

import type { EventWithDetails, OccurrenceWithTask, TaskWithRecurrence } from "~/types"
import { Calendar, Target } from "lucide-react"
import { Dialog, DialogContent} from "../ui/dialog"
import { useState } from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { OccurrenceInfo } from "./task-details/OccurrenceInfo"
import { EventSchedule } from "./task-details/EventSchedule"
import { EventActions } from "./task-details/EventActions"
import { ContextPanel } from "./task-details/ContextPanel"
import ModalHeader from "./task-details/ModalHeader"
import DescriptionBlock from "./task-details/DescriptionBlock"
import FixedInfo from "./task-details/FixedInfo"
import CompletedPanel from "./task-details/CompletedPanel"
import CompleteFooter from "./task-details/CompleteFooter"

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
  
  // Completion date/time states
  const [completionDate, setCompletionDate] = useState<string>("")
  const [completionTime, setCompletionTime] = useState<string>("")
  
  // Initialize completion date/time with current date/time
  useState(() => {
    const now = new Date()
    setCompletionDate(now.toISOString().split('T')[0] ?? "")
    setCompletionTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
  })

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
    onOpenChange(false)
    deleteEventMutation.mutate({ id: event.id })
  }

  const handleCompleteEvent = () => {
    if (!event?.id) return

    const timeInHours = dedicatedTime ? parseFloat(dedicatedTime) : undefined
    
    // Parse completion date and time
    let completedAt: Date | undefined = undefined
    if (completionDate && completionTime) {
      const [year, month, day] = completionDate.split('-').map(Number)
      const [hours, minutes] = completionTime.split(':').map(Number)
      completedAt = new Date(year!, month! - 1, day, hours, minutes)
    }

    completeEventMutation.mutate({
      id: event.id,
      dedicatedTime: timeInHours,
      completeOccurrence: completeOccurrence,
      completedAt
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-border bg-card">
        <ModalHeader title={task?.name || "Detalles del Evento"} />

        <div className="space-y-4 py-2">
          <DescriptionBlock description={task?.description} />

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

          {/* Occurrence Information Component */}
          <OccurrenceInfo displayOccurrence={displayOccurrence} task={task} />

          {event && (
            <>
              <EventSchedule 
                event={event}
                isEditing={isEditing}
                startEditMode={startEditMode}
                cancelEdit={cancelEdit}
                editDate={editDate}
                editStartTime={editStartTime}
                editEndTime={editEndTime}
                setEditDate={setEditDate}
                setEditStartTime={setEditStartTime}
                setEditEndTime={setEditEndTime}
                handleSaveEdit={handleSaveEdit}
                updateEventMutation={updateEventMutation}
              />

              {!isEditing && <ContextPanel context={event?.context} />}

                  {event.isFixed && !isEditing && <FixedInfo />}
            </>
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
          <EventActions 
            event={event}
            deleteEventMutation={deleteEventMutation}
            deleteEventHandler={handleDeleteEvent}
          />
        )}

        {/* Complete Event Section (modular) */}
        {event && !event.isCompleted && !isEditing && (
          <CompleteFooter
            event={event}
            eventHasStarted={eventHasStarted}
            completeEventMutation={completeEventMutation}
            completeEventHandler={handleCompleteEvent}
            skipEventMutation={skipEventMutation}
            skipEventHandler={handleSkipEvent}
            completeOccurrence={completeOccurrence}
            setCompleteOccurrence={setCompleteOccurrence}
            skipOccurrence={skipOccurrence}
            setSkipOccurrence={setSkipOccurrence}
            dedicatedTime={dedicatedTime}
            setDedicatedTime={setDedicatedTime}
            completionDate={completionDate}
            setCompletionDate={setCompletionDate}
            completionTime={completionTime}
            setCompletionTime={setCompletionTime}
          />
        )}

        {event && event.isCompleted && <CompletedPanel event={event} />}
      </DialogContent>
    </Dialog>
  )
}
