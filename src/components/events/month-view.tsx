"use client"

import type React from "react"

import type { EventWithDetails } from "~/types"
import { getMonthDays, isSameDay, isToday } from "~/lib/calendar-utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"

interface MonthViewProps {
  date: Date
  events: EventWithDetails[]
  onTimeSlotClick: (date: Date) => void
  onEventClick: (event: EventWithDetails) => void
  onDrop: (date: Date) => void
}

export function MonthView({ date, events, onTimeSlotClick, onEventClick, onDrop }: MonthViewProps) {
  const monthDays = getMonthDays(date)
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    onDrop(day)
  }

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border min-w-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-1 lg:p-2 text-center text-[10px] lg:text-xs font-medium text-muted-foreground border-r border-border last:border-r-0 truncate"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-w-0">
        {monthDays.map((day, index) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.start), day))
          const isCurrentMonth = day.getMonth() === date.getMonth()
          const isDayToday = isToday(day)

          return (
            <div
              key={index}
              className={`border-r border-b border-border last:border-r-0 p-1 lg:p-2 cursor-pointer hover:bg-accent/50 transition-colors min-w-0 overflow-hidden ${
                !isCurrentMonth ? "bg-muted/30" : ""
              }`}
              onClick={() => onTimeSlotClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div
                className={`text-[10px] lg:text-sm font-medium mb-0.5 lg:mb-1 ${
                  isDayToday
                    ? "w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5 lg:space-y-1">
                {dayEvents.slice(0, 2).map((event) => {
                  const taskTypeClassName = getTaskTypeClassName(event.occurrence?.task?.taskType, {
                    includeHover: true,
                    includeRing: false,
                  })
                  
                  return (
                    <div
                      key={event.id}
                      className={`text-[8px] lg:text-xs rounded px-0.5 lg:px-1 py-0.5 truncate cursor-pointer ${taskTypeClassName}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      {event.occurrence?.task?.name || "Sin título"}
                    </div>
                  )
                })}
                {dayEvents.length > 2 && (
                  <div className="text-[8px] lg:text-xs text-muted-foreground">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
