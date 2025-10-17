"use client"

import type { CalendarView, EventWithDetails } from "~/types"
import { getCurrentTimePosition, getWeekDays } from "~/lib/calendar-utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { DayView } from "./day-view"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Calendario</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="cursor-pointer" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="cursor-pointer" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="outline" className="cursor-pointer" size="sm" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">{getDateRangeLabel()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={view === "day" ? "default" : "outline"} className="cursor-pointer" size="sm" onClick={() => onViewChange("day")}>
            Día
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} className="cursor-pointer" size="sm" onClick={() => onViewChange("week")}>
            Semana
          </Button>
          <Button variant={view === "month" ? "default" : "outline"} className="cursor-pointer" size="sm" onClick={() => onViewChange("month")}>
            Mes
          </Button>
        </div>
      </div>

  {/* Calendar Content */}
  <div className="flex-1 overflow-auto scrollbar-themed">
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
