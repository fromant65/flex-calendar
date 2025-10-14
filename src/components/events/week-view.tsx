"use client"

import type React from "react"

import type { EventWithDetails } from "~/lib/types"
import { formatTime, getHoursArray, getWeekDays, isSameDay, isToday } from "~/lib/calendar-utils"
import { Clock } from "lucide-react"

interface WeekViewProps {
  date: Date
  events: EventWithDetails[]
  currentTime: number
  onTimeSlotClick: (date: Date, hour: number) => void
  onEventClick: (event: EventWithDetails) => void
  onDrop: (date: Date, hour: number) => void
  onEventDragStart: (event: EventWithDetails) => void
}

export function WeekView({
  date,
  events,
  currentTime,
  onTimeSlotClick,
  onEventClick,
  onDrop,
  onEventDragStart,
}: WeekViewProps) {
  const hours = getHoursArray()
  const weekDays = getWeekDays(date)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault()
    onDrop(day, hour)
  }

  return (
    <div className="relative">
      {/* Header with day names */}
      <div className="flex border-b border-border sticky top-0 bg-background z-20">
        <div className="w-20 flex-shrink-0 border-r border-border" />
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="flex-1 p-2 text-center border-r border-border last:border-r-0">
            <div className="text-xs text-muted-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
            <div className={`text-sm font-medium ${isToday(day) ? "text-primary" : "text-foreground"}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex">
        {/* Time column */}
        <div className="w-20 flex-shrink-0 border-r border-border">
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-border flex items-start justify-end pr-2 pt-1">
              <span className="text-xs text-muted-foreground">{formatTime(hour)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.start), day))
          const showCurrentTime = isToday(day)

          return (
            <div key={day.toISOString()} className="flex-1 relative border-r border-border last:border-r-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotClick(day, hour)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, hour)}
                />
              ))}

              {/* Current time indicator */}
              {showCurrentTime && (
                <div
                  className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                  style={{ top: `${currentTime * 4}rem` }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 h-px bg-primary" />
                </div>
              )}

              {/* Events */}
              {dayEvents.map((event) => {
                const start = new Date(event.start)
                const finish = new Date(event.finish)
                const startHour = start.getHours() + start.getMinutes() / 60
                const duration = (finish.getTime() - start.getTime()) / (1000 * 60 * 60)

                return (
                  <div
                    key={event.id}
                    draggable={!event.isFixed}
                    onDragStart={() => onEventDragStart(event)}
                    className={`absolute left-1 right-1 bg-primary/20 border-l-2 border-primary rounded p-1 hover:bg-primary/30 transition-colors overflow-hidden ${
                      event.isFixed ? "cursor-default" : "cursor-move"
                    }`}
                    style={{
                      top: `${startHour * 4}rem`,
                      height: `${duration * 4}rem`,
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="text-xs font-medium text-foreground line-clamp-1">
                      {event.occurrence?.task?.name ?? "Untitled"}
                      {event.isFixed && " 🔒"}
                    </div>
                    {duration >= 0.5 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2 h-2" />
                        <span className="text-[10px]">
                          {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
