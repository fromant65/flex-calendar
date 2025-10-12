"use client"

import { CalendarViewComponent } from "~/components/calendar-view"
import { EisenhowerMatrix } from "~/components/eisenhower-matrix"
import { ScheduleDialog } from "~/components/schedule-dialog"
import { TaskDetailsModal } from "~/components/task-details-modal"
import { mockTrpc, subscribeToUpdates } from "~/lib/mock-trpc"
import type { CalendarView, EventWithDetails, OccurrenceWithTask } from "~/lib/types"
import { useEffect, useState } from "react"

export default function TaskCalendarPage() {
  const [calendarView, setCalendarView] = useState<CalendarView>("week")
  const [selectedTask, setSelectedTask] = useState<OccurrenceWithTask | null>(null)
  const [draggedTask, setDraggedTask] = useState<OccurrenceWithTask | null>(null)
  const [draggedEvent, setDraggedEvent] = useState<EventWithDetails | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined)
  const [, setRefreshTrigger] = useState(0)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsOccurrence, setDetailsOccurrence] = useState<OccurrenceWithTask | null>(null)
  const [detailsEvent, setDetailsEvent] = useState<EventWithDetails | null>(null)
  const [eventToReschedule, setEventToReschedule] = useState<EventWithDetails | null>(null)

  // Fetch data using mock tRPC
  const { data: events = [] } = mockTrpc.calendarEvent.getMyEventsWithDetails.useQuery()
  const { data: occurrences = [] } = mockTrpc.occurrence.getByDateRange.useQuery()
  const createEventMutation = mockTrpc.calendarEvent.create.useMutation()
  const updateEventMutation = mockTrpc.calendarEvent.update.useMutation()

  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      setRefreshTrigger((prev) => prev + 1)
    })
    return unsubscribe
  }, [])

  const availableOccurrences = occurrences.filter((occurrence) => {
    const hasActiveEvent = events.some((event) => event.associatedOccurrenceId === occurrence.id && !event.isCompleted)
    return !hasActiveEvent
  })

  const handleTaskSelect = (occurrence: OccurrenceWithTask) => {
    setSelectedTask(occurrence)
  }

  const handleTaskDragStart = (occurrence: OccurrenceWithTask) => {
    setDraggedTask(occurrence)
  }

  const handleEventDragStart = (event: EventWithDetails) => {
    if (!event.isFixed) {
      setDraggedEvent(event)
    }
  }

  const handleCalendarDrop = (date: Date, hour?: number) => {
    if (draggedTask) {
      setSelectedTask(draggedTask)
      setSelectedDate(date)
      setSelectedHour(hour)
      setEventToReschedule(null)
      setScheduleDialogOpen(true)
      setDraggedTask(null)
    } else if (draggedEvent) {
      setEventToReschedule(draggedEvent)
      setSelectedTask(null)
      setSelectedDate(date)
      setSelectedHour(hour)
      setScheduleDialogOpen(true)
      setDraggedEvent(null)
    }
  }

  const handleTimeSlotClick = (date: Date, hour?: number) => {
    if (selectedTask) {
      setSelectedDate(date)
      setSelectedHour(hour)
      setEventToReschedule(null)
      setScheduleDialogOpen(true)
    }
  }

  const handleEventClick = (event: EventWithDetails) => {
    setDetailsEvent(event)
    setDetailsOccurrence(null)
    setDetailsModalOpen(true)
  }

  const handleOccurrenceClick = (occurrence: OccurrenceWithTask) => {
    setDetailsOccurrence(occurrence)
    setDetailsEvent(null)
    setDetailsModalOpen(true)
  }

  const handleSchedule = (start: Date, finish: Date) => {
    if (eventToReschedule) {
      updateEventMutation.mutate({
        id: eventToReschedule.id,
        start,
        finish,
      })
      setEventToReschedule(null)
    } else if (selectedTask) {
      // Create new event
      createEventMutation.mutate({
        associatedOccurrenceId: selectedTask.id,
        isFixed: false,
        start,
        finish,
      })
    }

    setSelectedTask(null)
    setSelectedDate(null)
    setSelectedHour(undefined)
  }

  return (
    <div className="h-screen flex flex-col dark">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Task Planner</h1>
          <p className="text-sm text-muted-foreground">Organize and schedule your tasks efficiently</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Eisenhower Matrix */}
        <div className="w-[400px] border-r border-border bg-card">
          <EisenhowerMatrix
            occurrences={availableOccurrences}
            onTaskSelect={handleTaskSelect}
            onTaskDragStart={handleTaskDragStart}
            onTaskClick={handleOccurrenceClick}
            selectedTaskId={selectedTask?.id}
          />
        </div>

        {/* Right Panel: Calendar */}
        <div className="flex-1 bg-background">
          <CalendarViewComponent
            events={events}
            view={calendarView}
            onViewChange={setCalendarView}
            onTimeSlotClick={handleTimeSlotClick}
            onEventClick={handleEventClick}
            onDrop={handleCalendarDrop}
            onEventDragStart={handleEventDragStart}
          />
        </div>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        occurrence={selectedTask}
        event={eventToReschedule}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        onSchedule={handleSchedule}
      />

      <TaskDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        occurrence={detailsOccurrence}
        event={detailsEvent}
      />
    </div>
  )
}
