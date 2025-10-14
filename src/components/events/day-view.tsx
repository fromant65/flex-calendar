"use client"

import type React from "react"

import type { EventWithDetails } from "~/lib/types"
import { formatTime, getHoursArray, isToday } from "~/lib/calendar-utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"
import { Clock } from "lucide-react"

interface DayViewProps {
  date: Date
  events: EventWithDetails[]
  currentTime: number
  onTimeSlotClick: (date: Date, hour: number) => void
  onEventClick: (event: EventWithDetails) => void
  onDrop: (date: Date, hour: number) => void
  onEventDragStart: (event: EventWithDetails) => void
}

export function DayView({
  date,
  events,
  currentTime,
  onTimeSlotClick,
  onEventClick,
  onDrop,
  onEventDragStart,
}: DayViewProps) {
  const hours = getHoursArray()
  const showCurrentTime = isToday(date)

  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start)
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    )
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault()
    onDrop(date, hour)
  }

  return (
    <div className="relative">
      {/* Time column */}
      <div className="flex">
        <div className="w-20 flex-shrink-0 border-r border-border">
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-border flex items-start justify-end pr-2 pt-1">
              <span className="text-xs text-muted-foreground">{formatTime(hour)}</span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => onTimeSlotClick(date, hour)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, hour)}
            />
          ))}

          {/* Current time indicator */}
          {showCurrentTime && (
            <div
              className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
              style={{ top: `${currentTime * 4}rem` }}
            >
              <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 h-px bg-primary" />
            </div>
          )}

          {/* Events */}
          {dayEvents.map((event) => {
            const start = new Date(event.start)
            const finish = new Date(event.finish)
            const startHour = start.getHours() + start.getMinutes() / 60
            const duration = (finish.getTime() - start.getTime()) / (1000 * 60 * 60)
            const taskTypeClassName = getTaskTypeClassName(event.occurrence?.task?.taskType, {
              includeHover: true,
              includeRing: false,
            })

            return (
              <div
                key={event.id}
                draggable={!event.isFixed}
                onDragStart={() => onEventDragStart(event)}
                className={`absolute left-2 right-2 border-l-4 rounded p-2 transition-colors ${taskTypeClassName} ${
                  event.isFixed ? "cursor-default" : "cursor-move"
                }`}
                style={{
                  top: `${startHour * 4}rem`,
                  height: `${duration * 4}rem`,
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="text-xs font-medium text-foreground line-clamp-1">
                  {event.occurrence?.task?.name || "Untitled Event"}
                  {event.isFixed && " 🔒"}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} -{" "}
                    {finish.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
