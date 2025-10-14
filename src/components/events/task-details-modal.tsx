"use client"

import type { EventWithDetails, OccurrenceWithTask } from "~/lib/types"
import { Calendar, Clock, Flag, Lock, Target, CheckCircle2 } from "lucide-react"
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

  const [dedicatedTime, setDedicatedTime] = useState<string>("")
  const [isCompleting, setIsCompleting] = useState(false)

  const completeEventMutation = api.calendarEvent.complete.useMutation({
    onSuccess: () => {
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
    onSuccess: () => {
      onOpenChange(false)
      if (onEventCompleted) onEventCompleted()
    },
    onError: (err) => console.error("Error skipping event", err),
  })

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
              <h4 className="text-sm font-medium text-foreground">Scheduled Time</h4>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
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
                <Clock className="w-4 h-4 text-muted-foreground" />
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

              {event.isFixed && (
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

        {/* Complete Event Section - only show for events that are not completed */}
        {event && !event.isCompleted && (
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
                    <Button variant="ghost" className="flex-1">
                      Skip
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
                    <Button className="flex-1 bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      {completeEventMutation.isPending ? "Completing..." : "Mark as Completed"}
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
                      <AlertDialogAction
                        onClick={() => {
                          handleCompleteEvent()
                        }}
                      >
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
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
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
