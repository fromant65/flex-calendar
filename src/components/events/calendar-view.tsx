"use client"

import type { CalendarView, EventWithDetails } from "~/types"
import { getCurrentTimePosition, getWeekDays } from "~/lib/calendar-utils"
import { useEffect, useState } from "react"
import { DayView } from "./day-view"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { CalendarHeader } from "./calendar-header"

interface CalendarViewProps {
  events: EventWithDetails[]
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onTimeSlotClick: (date: Date, hour?: number) => void
  onEventClick: (event: EventWithDetails) => void
  onDrop: (date: Date, hour?: number) => void
  onEventDragStart: (event: EventWithDetails) => void
}

export function CalendarViewComponent({
  events,
  view,
  onViewChange,
  onTimeSlotClick,
  onEventClick,
  onDrop,
  onEventDragStart,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(getCurrentTimePosition())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimePosition())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      // For month view, set to day 1 to avoid date overflow issues
      newDate.setDate(1)
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      // For month view, set to day 1 to avoid date overflow issues
      newDate.setDate(1)
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDateRangeLabel = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (view === "week") {
      const weekDays = getWeekDays(currentDate)
      const start = weekDays[0]
      const end = weekDays[6]
      return `${start?.toLocaleDateString("es-ES", { month: "short", day: "numeric" })} - ${end?.toLocaleDateString(
        "es-ES",
        { month: "short", day: "numeric", year: "numeric" },
      )}`
    } else {
      return currentDate.toLocaleDateString("es-ES", { year: "numeric", month: "long" })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={onViewChange}
        onNavigatePrevious={navigatePrevious}
        onNavigateNext={navigateNext}
        onGoToToday={goToToday}
        getDateRangeLabel={getDateRangeLabel}
      />

      {/* Calendar Content */}
      <div className="flex-1 min-h-0 overflow-auto scrollbar-themed">
        {view === "day" && (
          <DayView
            date={currentDate}
            events={events}
            currentTime={currentTime}
            onTimeSlotClick={onTimeSlotClick}
            onEventClick={onEventClick}
            onDrop={onDrop}
            onEventDragStart={onEventDragStart}
          />
        )}
        {view === "week" && (
          <WeekView
            date={currentDate}
            events={events}
            currentTime={currentTime}
            onTimeSlotClick={onTimeSlotClick}
            onEventClick={onEventClick}
            onDrop={onDrop}
            onEventDragStart={onEventDragStart}
          />
        )}
        {view === "month" && (
          <MonthView
            date={currentDate}
            events={events}
            onTimeSlotClick={onTimeSlotClick}
            onEventClick={onEventClick}
            onDrop={onDrop}
          />
        )}
      </div>
    </div>
  )
}
