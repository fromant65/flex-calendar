"use client"

import type React from "react"

import type { EventWithDetails } from "~/lib/types"
import { getMonthDays, isSameDay, isToday } from "~/lib/calendar-utils"

interface MonthViewProps {
  date: Date
  events: EventWithDetails[]
  onTimeSlotClick: (date: Date) => void
  onEventClick: (event: EventWithDetails) => void
  onDrop: (date: Date) => void
}

export function MonthView({ date, events, onTimeSlotClick, onEventClick, onDrop }: MonthViewProps) {
  const monthDays = getMonthDays(date)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    onDrop(day)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {monthDays.map((day, index) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.start), day))
          const isCurrentMonth = day.getMonth() === date.getMonth()
          const isDayToday = isToday(day)

          return (
            <div
              key={index}
              className={`border-r border-b border-border last:border-r-0 p-2 cursor-pointer hover:bg-accent/50 transition-colors ${
                !isCurrentMonth ? "bg-muted/30" : ""
              }`}
              onClick={() => onTimeSlotClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isDayToday
                    ? "w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-primary/20 border-l-2 border-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/30"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    {event.task?.name || "Untitled"}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
