"use client"

import type { CalendarView } from "~/types"
import type { CalendarEventLike, CalendarOccurrenceLike } from "~/types/v2-ui"
import { createContext, useContext, useState, type ReactNode } from "react"

// Context for managing events page state and reducing prop drilling
// This context handles:
// - Calendar view state (day/week/month)
// - Selected tasks and events
// - Dragged items for drag-and-drop
// - Dialog states (schedule, details, confirmation)
// - Mobile view state (matrix/calendar)

interface EventsContextValue {
  // Calendar state
  calendarView: CalendarView
  setCalendarView: (view: CalendarView) => void
  
  // Selection state
  selectedTask: CalendarOccurrenceLike | null
  setSelectedTask: (task: CalendarOccurrenceLike | null) => void
  
  // Drag state
  draggedTask: CalendarOccurrenceLike | null
  setDraggedTask: (task: CalendarOccurrenceLike | null) => void
  draggedEvent: CalendarEventLike | null
  setDraggedEvent: (event: CalendarEventLike | null) => void
  
  // Schedule dialog state
  scheduleDialogOpen: boolean
  setScheduleDialogOpen: (open: boolean) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  selectedHour: number | undefined
  setSelectedHour: (hour: number | undefined) => void
  eventToReschedule: CalendarEventLike | null
  setEventToReschedule: (event: CalendarEventLike | null) => void
  
  // Details modal state
  detailsModalOpen: boolean
  setDetailsModalOpen: (open: boolean) => void
  detailsOccurrence: CalendarOccurrenceLike | null
  setDetailsOccurrence: (occurrence: CalendarOccurrenceLike | null) => void
  detailsEvent: CalendarEventLike | null
  setDetailsEvent: (event: CalendarEventLike | null) => void
  
  // Mobile view state
  mobileView: "matrix" | "calendar"
  setMobileView: (view: "matrix" | "calendar") => void
  
  // Confirmation dialog state (mobile)
  confirmScheduleDialogOpen: boolean
  setConfirmScheduleDialogOpen: (open: boolean) => void
  pendingScheduleTask: CalendarOccurrenceLike | null
  setPendingScheduleTask: (task: CalendarOccurrenceLike | null) => void
  
  // Date range filter state
  filterStartDate: Date
  setFilterStartDate: (date: Date) => void
  filterEndDate: Date
  setFilterEndDate: (date: Date) => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  // Calculate default date range (current week)
  const today = new Date()
  const defaultStartOfWeek = new Date(today)
  defaultStartOfWeek.setDate(today.getDate() - today.getDay())
  defaultStartOfWeek.setHours(0, 0, 0, 0)
  const defaultEndOfWeek = new Date(defaultStartOfWeek)
  defaultEndOfWeek.setDate(defaultStartOfWeek.getDate() + 7)
  
  // Calendar state
  const [calendarView, setCalendarView] = useState<CalendarView>("week")
  
  // Selection state
  const [selectedTask, setSelectedTask] = useState<CalendarOccurrenceLike | null>(null)
  
  // Date range filter state
  const [filterStartDate, setFilterStartDate] = useState<Date>(defaultStartOfWeek)
  const [filterEndDate, setFilterEndDate] = useState<Date>(defaultEndOfWeek)
  
  // Drag state
  const [draggedTask, setDraggedTask] = useState<CalendarOccurrenceLike | null>(null)
  const [draggedEvent, setDraggedEvent] = useState<CalendarEventLike | null>(null)
  
  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined)
  const [eventToReschedule, setEventToReschedule] = useState<CalendarEventLike | null>(null)
  
  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsOccurrence, setDetailsOccurrence] = useState<CalendarOccurrenceLike | null>(null)
  const [detailsEvent, setDetailsEvent] = useState<CalendarEventLike | null>(null)
  
  // Mobile view state
  const [mobileView, setMobileView] = useState<"matrix" | "calendar">("matrix")
  
  // Confirmation dialog state (mobile)
  const [confirmScheduleDialogOpen, setConfirmScheduleDialogOpen] = useState(false)
  const [pendingScheduleTask, setPendingScheduleTask] = useState<CalendarOccurrenceLike | null>(null)

  return (
    <EventsContext.Provider
      value={{
        calendarView,
        setCalendarView,
        selectedTask,
        setSelectedTask,
        draggedTask,
        setDraggedTask,
        draggedEvent,
        setDraggedEvent,
        scheduleDialogOpen,
        setScheduleDialogOpen,
        selectedDate,
        setSelectedDate,
        selectedHour,
        setSelectedHour,
        eventToReschedule,
        setEventToReschedule,
        detailsModalOpen,
        setDetailsModalOpen,
        detailsOccurrence,
        setDetailsOccurrence,
        detailsEvent,
        setDetailsEvent,
        mobileView,
        setMobileView,
        confirmScheduleDialogOpen,
        setConfirmScheduleDialogOpen,
        pendingScheduleTask,
        setPendingScheduleTask,
        filterStartDate,
        setFilterStartDate,
        filterEndDate,
        setFilterEndDate,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEventsContext() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error("useEventsContext must be used within EventsProvider")
  }
  return context
}
