"use client"

import type { EventWithDetails, OccurrenceWithTask } from "~/lib/types"
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


type TaskLike = {
  id?: number
  name?: string
  description?: string | null
  importance?: number
}

interface TaskDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskLike | null
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
      setIsEditing(false)
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      if (onEventCompleted) onEventCompleted()
    },
    onError: (err) => console.error("Error updating event", err),
  })

  const deleteEventMutation = api.calendarEvent.delete.useMutation({
    onSuccess: async () => {
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      onOpenChange(false)
      if (onEventCompleted) onEventCompleted()
    },
    onError: (err) => console.error("Error deleting event", err),
  })

  const completeEventMutation = api.calendarEvent.complete.useMutation({
    onSuccess: async () => {
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
      console.error("Error completing event:", error)
      setIsCompleting(false)
    }
  })

  const skipEventMutation = api.calendarEvent.update.useMutation({
    onSuccess: async () => {
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidate all occurrence queries
      onOpenChange(false)
      if (onEventCompleted) onEventCompleted()
    },
    onError: (err) => console.error("Error skipping event", err),
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

  if (!task && !event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{task?.name || "Event Details"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task?.description ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm text-foreground">{task.description}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            {task ? (
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Importance</p>
                  <p className="text-sm font-medium text-foreground">{task.importance}/10</p>
                </div>
              </div>
            ) : "No task data available"}

            {displayOccurrence?.urgency ? (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Urgency</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.urgency}/10</p>
                </div>
              </div>
            ) : "No urgency data available"}

            {displayOccurrence?.targetTimeConsumption && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Target Duration</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.targetTimeConsumption} {displayOccurrence.targetTimeConsumption===1? "h":"hs"}</p>
                </div>
              </div>
            )}

            {displayOccurrence?.status && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.status}</p>
                </div>
              </div>
            )}
          </div>

          {event && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Scheduled Time</h4>
                {!event.isCompleted && !isEditing && (
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

        {/* Delete Event Button - show for non-completed events */}
        {event && !event.isCompleted && !isEditing && (
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

        {/* Complete Event Section - only show for events that are not completed */}
        {event && !event.isCompleted && !isEditing && (
          <DialogFooter className="border-t border-border pt-4">
            <div className="w-full space-y-3">
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
                    <Button variant="default" className="flex-1" disabled={completeEventMutation.isPending}>
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
