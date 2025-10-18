"use client"

import type { CalendarView, EventWithDetails, OccurrenceWithTask } from "~/types"
import { createContext, useContext, useState, type ReactNode } from "react"

// TODO: Context for managing events page state and reducing prop drilling
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
  selectedTask: OccurrenceWithTask | null
  setSelectedTask: (task: OccurrenceWithTask | null) => void
  
  // Drag state
  draggedTask: OccurrenceWithTask | null
  setDraggedTask: (task: OccurrenceWithTask | null) => void
  draggedEvent: EventWithDetails | null
  setDraggedEvent: (event: EventWithDetails | null) => void
  
  // Schedule dialog state
  scheduleDialogOpen: boolean
  setScheduleDialogOpen: (open: boolean) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  selectedHour: number | undefined
  setSelectedHour: (hour: number | undefined) => void
  eventToReschedule: EventWithDetails | null
  setEventToReschedule: (event: EventWithDetails | null) => void
  
  // Details modal state
  detailsModalOpen: boolean
  setDetailsModalOpen: (open: boolean) => void
  detailsOccurrence: OccurrenceWithTask | null
  setDetailsOccurrence: (occurrence: OccurrenceWithTask | null) => void
  detailsEvent: EventWithDetails | null
  setDetailsEvent: (event: EventWithDetails | null) => void
  
  // Mobile view state
  mobileView: "matrix" | "calendar"
  setMobileView: (view: "matrix" | "calendar") => void
  
  // Confirmation dialog state (mobile)
  confirmScheduleDialogOpen: boolean
  setConfirmScheduleDialogOpen: (open: boolean) => void
  pendingScheduleTask: OccurrenceWithTask | null
  setPendingScheduleTask: (task: OccurrenceWithTask | null) => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  // Calendar state
  const [calendarView, setCalendarView] = useState<CalendarView>("week")
  
  // Selection state
  const [selectedTask, setSelectedTask] = useState<OccurrenceWithTask | null>(null)
  
  // Drag state
  const [draggedTask, setDraggedTask] = useState<OccurrenceWithTask | null>(null)
  const [draggedEvent, setDraggedEvent] = useState<EventWithDetails | null>(null)
  
  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined)
  const [eventToReschedule, setEventToReschedule] = useState<EventWithDetails | null>(null)
  
  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsOccurrence, setDetailsOccurrence] = useState<OccurrenceWithTask | null>(null)
  const [detailsEvent, setDetailsEvent] = useState<EventWithDetails | null>(null)
  
  // Mobile view state
  const [mobileView, setMobileView] = useState<"matrix" | "calendar">("matrix")
  
  // Confirmation dialog state (mobile)
  const [confirmScheduleDialogOpen, setConfirmScheduleDialogOpen] = useState(false)
  const [pendingScheduleTask, setPendingScheduleTask] = useState<OccurrenceWithTask | null>(null)

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
