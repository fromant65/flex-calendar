"use client"

import type React from "react"

import type { EventWithDetails } from "~/types"
import { formatTime, getHoursArray, isToday, ensureLocalDate, groupOverlappingEvents } from "~/lib/calendar-utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"
import { Clock } from "lucide-react"
import { OverlappingEventsIndicator } from "./overlapping-events-indicator"

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
    const eventDate = ensureLocalDate(event.start)
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    )
  })

  // Group overlapping events
  const overlappingGroups = groupOverlappingEvents(dayEvents)
  const eventsInGroups = new Set(
    overlappingGroups.flatMap(group => group.events.map(e => e.id))
  )
  const standaloneEvents = dayEvents.filter(event => !eventsInGroups.has(event.id))

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault()
    onDrop(date, hour)
  }

  return (
    <div className="relative min-w-0 [--cell-height:3rem] lg:[--cell-height:4rem]">
      {/* Time column */}
      <div className="flex min-w-0">
        <div className="w-12 lg:w-20 flex-shrink-0 border-r border-border">
          {hours.map((hour) => (
            <div key={hour} className="h-12 lg:h-16 border-b border-border flex items-start justify-end pr-1 lg:pr-2 pt-1">
              <span className="text-[10px] lg:text-xs text-muted-foreground">{formatTime(hour)}</span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 min-w-0 relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-12 lg:h-16 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => onTimeSlotClick(date, hour)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, hour)}
            />
          ))}

          {/* Current time indicator */}
          {showCurrentTime && (
            <div
              className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
              style={{ top: `calc(${currentTime} * var(--cell-height))` }}
            >
              <div className="w-2 lg:w-3 h-2 lg:h-3 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 h-px bg-primary" />
            </div>
          )}

          {/* Overlapping Events Indicators */}
          {overlappingGroups.map((group, index) => (
            <OverlappingEventsIndicator
              key={`group-${index}`}
              events={group.events}
              startHour={group.startHour}
              duration={group.duration}
              onEventClick={onEventClick}
            />
          ))}

          {/* Standalone Events */}
          {standaloneEvents.map((event) => {
            const start = ensureLocalDate(event.start)
            const finish = ensureLocalDate(event.finish)
            const startHour = start.getHours() + start.getMinutes() / 60
            const duration = (finish.getTime() - start.getTime()) / (1000 * 60 * 60)
            const taskTypeClassName = getTaskTypeClassName(event.occurrence?.task?.taskType, {
              includeHover: true,
              includeRing: false,
            })

            return (
              <div
                key={event.id}
                draggable={!event.isFixed && !event.isCompleted && event.occurrence?.status !== "Skipped"}
                onDragStart={() => onEventDragStart(event)}
                className={`absolute left-1 lg:left-2 right-1 lg:right-2 border-l-2 lg:border-l-4 rounded p-1 lg:p-2 transition-colors ${taskTypeClassName} ${
                  (event.isCompleted || event.isFixed) ? "cursor-pointer" : "cursor-move"
                } ${event.isCompleted ? "event--completed" : ""}`}
                style={{
                  top: `calc(${startHour} * var(--cell-height))`,
                  height: `calc(${duration} * var(--cell-height))`,
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="text-[10px] lg:text-xs font-medium text-foreground line-clamp-1">
                  {event.occurrence?.task?.name || "Untitled Event"}
                  {event.isFixed && " 🔒"}
                </div>
                <div className="text-[10px] lg:text-xs text-muted-foreground flex items-center gap-1 mt-0.5 lg:mt-1">
                  <Clock className="w-2 lg:w-3 h-2 lg:h-3" />
                  <span className="truncate">
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
