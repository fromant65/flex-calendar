"use client"

import type { EventWithDetails, OccurrenceWithTask } from "~/lib/types"
import { Calendar, Clock, Flag, Lock, Target } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"


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
}

export function TaskDetailsModal({ open, onOpenChange, task: taskProp, occurrence, event }: TaskDetailsModalProps) {
  const task = taskProp || occurrence?.task || event?.task
  const displayOccurrence = occurrence || event?.occurrence

  if (!task && !event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{task?.name || "Event Details"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task?.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm text-foreground">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {task && (
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Importance</p>
                  <p className="text-sm font-medium text-foreground">{task.importance}/10</p>
                </div>
              </div>
            )}

            {displayOccurrence?.urgency && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Urgency</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.urgency}/10</p>
                </div>
              </div>
            )}

            {displayOccurrence?.targetTimeConsumption && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Target Duration</p>
                  <p className="text-sm font-medium text-foreground">{displayOccurrence.targetTimeConsumption}m</p>
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

              <div className="flex items-center gap-2">
                <div className="w-4 h-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">{event.dedicatedTime} minutes</p>
                </div>
              </div>
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
      </DialogContent>
    </Dialog>
  )
}
