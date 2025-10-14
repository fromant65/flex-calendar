"use client"

import type { EventWithDetails, OccurrenceWithTask } from "~/lib/types"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occurrence: OccurrenceWithTask | null
  event?: EventWithDetails | null
  selectedDate: Date | null
  selectedHour?: number
  onSchedule: (start: Date, finish: Date) => void
}

export function ScheduleDialog({
  open,
  onOpenChange,
  occurrence,
  event,
  selectedDate,
  selectedHour,
  onSchedule,
}: ScheduleDialogProps) {
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
    if (event) {
      // Editing existing event
      const start = new Date(event.start)
      const end = new Date(event.finish)
      setStartTime(`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`)
      setEndTime(`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`)
    } else if (selectedHour !== undefined) {
      // New event with suggested hour
      setStartTime(`${String(selectedHour).padStart(2, "0")}:00`)
      // targetTimeConsumption is in HOURS, convert to minutes
      const suggestedDurationMinutes = (occurrence?.targetTimeConsumption || 1) * 60
      const endHour = Math.floor((selectedHour * 60 + suggestedDurationMinutes) / 60)
      const endMinute = (selectedHour * 60 + suggestedDurationMinutes) % 60
      setEndTime(`${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`)
    } else {
      // Default times
      setStartTime("09:00")
      // targetTimeConsumption is in HOURS, convert to minutes
      const suggestedDurationMinutes = (occurrence?.targetTimeConsumption || 1) * 60
      const endHour = Math.floor((9 * 60 + suggestedDurationMinutes) / 60)
      const endMinute = (9 * 60 + suggestedDurationMinutes) % 60
      setEndTime(`${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`)
    }
  }, [event, selectedHour, occurrence, open])

  const handleSchedule = () => {
    if (!selectedDate || !startTime || !endTime) return

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const start = new Date(selectedDate)
    start.setHours(startHour!, startMinute, 0, 0)

    const finish = new Date(selectedDate)
    finish.setHours(endHour!, endMinute, 0, 0)

    // Validate that end time is after start time
    if (finish <= start) {
      alert("End time must be after start time")
      return
    }

    onSchedule(start, finish)
    onOpenChange(false)
  }

  const task = occurrence?.task || event?.occurrence?.task

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Reschedule Event" : "Schedule Task"}</DialogTitle>
          <DialogDescription>
            {event ? "Update the time for this event" : "Set the time range for this task"}
          </DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">{task.name}</h4>
              {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
            </div>

            {selectedDate && (
              <div className="text-sm text-muted-foreground mb-4">
                <p className="font-medium text-foreground">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {startTime &&
              endTime &&
              (() => {
                const [startHour, startMinute] = startTime.split(":").map(Number)
                const [endHour, endMinute] = endTime.split(":").map(Number)
                const durationMinutes = endHour! * 60 + endMinute! - (startHour! * 60 + startMinute!)

                if (durationMinutes > 0) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Duration: {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                      </p>
                    </div>
                  )
                }
                return null
              })()}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>{event ? "Update" : "Schedule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
