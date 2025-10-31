"use client"

import type React from "react"

import type { EventWithDetails } from "~/types"
import { formatTime, getHoursArray, getWeekDays, isSameDay, isToday, ensureLocalDate, groupOverlappingEvents } from "~/lib/calendar-utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"
import { Clock } from "lucide-react"
import { OverlappingEventsIndicator } from "./overlapping-events-indicator"

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
    <div className="relative min-w-0 [--cell-height:3rem] lg:[--cell-height:4rem]">
      {/* Header with day names */}
      <div className="flex border-b border-border sticky top-0 bg-background z-20 min-w-0">
        <div className="w-12 lg:w-20 flex-shrink-0 border-r border-border" />
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="flex-1 min-w-0 p-1 lg:p-2 text-center border-r border-border last:border-r-0">
            <div className="text-[10px] lg:text-xs text-muted-foreground truncate">{day.toLocaleDateString("es-ES", { weekday: "short" })}</div>
            <div className={`text-xs lg:text-sm font-medium ${isToday(day) ? "text-primary" : "text-foreground"}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex min-w-0">
        {/* Time column */}
        <div className="w-12 lg:w-20 flex-shrink-0 border-r border-border">
          {hours.map((hour) => (
            <div key={hour} className="h-12 lg:h-16 border-b border-border flex items-start justify-end pr-1 lg:pr-2 pt-1">
              <span className="text-[10px] lg:text-xs text-muted-foreground">{formatTime(hour)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day: Date) => {
          const dayEvents = events.filter((event) => isSameDay(ensureLocalDate(event.start), day))
          const showCurrentTime = isToday(day)

          // Group overlapping events for this day
          const overlappingGroups = groupOverlappingEvents(dayEvents)
          const eventsInGroups = new Set(
            overlappingGroups.flatMap(group => group.events.map(e => e.id))
          )
          const standaloneEvents = dayEvents.filter(event => !eventsInGroups.has(event.id))

          return (
            <div key={day.toISOString()} className="flex-1 min-w-0 relative border-r border-border last:border-r-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-12 lg:h-16 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotClick(day, hour)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, hour)}
                />
              ))}

              {/* Current time indicator */}
              {showCurrentTime && (
                <div
                  className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                  style={{ top: `calc(${currentTime} * var(--cell-height))` }}
                >
                  <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 h-px bg-primary" />
                </div>
              )}

              {/* Overlapping Events Indicators */}
              {overlappingGroups.map((group, index) => (
                <OverlappingEventsIndicator
                  key={`group-${day.toISOString()}-${index}`}
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
                    className={`absolute left-0.5 lg:left-1 right-0.5 lg:right-1 rounded p-0.5 lg:p-1 transition-colors overflow-hidden ${taskTypeClassName} ${
                          (event.isCompleted || event.isFixed) ? "cursor-pointer" : "cursor-move"
                        } ${event.isCompleted ? "event--completed" : ""}`}
                    style={{
                      top: `calc(${startHour} * var(--cell-height))`,
                      height: `calc(${duration} * var(--cell-height))`,
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="text-[10px] lg:text-xs font-medium text-foreground line-clamp-1">
                      {event.occurrence?.task?.name ? event.occurrence?.task?.name : "Untitled"}
                      {event.isFixed && " 🔒"}
                    </div>
                    {duration >= 0.5 && (
                      <div className="hidden lg:flex text-xs text-muted-foreground items-center gap-1">
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
