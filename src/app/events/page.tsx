"use client"

import { useEffect } from "react"
import { ScheduleDialog } from "~/components/events/schedule-dialog"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { ConfirmScheduleDialog } from "~/components/events/confirm-schedule-dialog"
import { EventsProvider, useEventsContext } from "~/components/events/events-context"
import { EventsPageHeader } from "~/components/events/events-page-header"
import { DesktopLayout } from "~/components/events/desktop-layout"
import { MobileLayout } from "~/components/events/mobile-layout"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import type { EventWithDetails, OccurrenceWithTask } from "~/types"

// TODO: Modularized events page
// Main responsibilities:
// - Data fetching (events and occurrences)
// - Event handlers (task selection, scheduling, drag-and-drop)
// - Rendering layout components (header, desktop/mobile layouts, dialogs)

function EventsPageContent() {
  const {
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
    detailsModalOpen,
    setDetailsModalOpen,
    detailsOccurrence,
    setDetailsOccurrence,
    detailsEvent,
    setDetailsEvent,
    eventToReschedule,
    setEventToReschedule,
    setMobileView,
    confirmScheduleDialogOpen,
    setConfirmScheduleDialogOpen,
    pendingScheduleTask,
    setPendingScheduleTask,
  } = useEventsContext()

  // Get utils for query invalidation
  const utils = api.useUtils()

  // Calculate date range for queries (current week)
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  // Fetch data using tRPC API
  const { data: eventsData = [], isLoading: eventsLoading, error: eventsError } = api.calendarEvent.getMyEventsWithDetails.useQuery()

  const { data: occurrencesData = [], isLoading: occurrencesLoading, error: occurrencesError } = api.occurrence.getByDateRange.useQuery({
    startDate: startOfWeek,
    endDate: endOfWeek,
  })

  // Show query errors as toasts (type-safe)
  useEffect(() => {
    if (eventsError) {
      toast.error("Error al cargar eventos", { description: eventsError.message || "No se pudieron cargar los eventos" })
      console.error("Error fetching events:", eventsError)
    }
    if (occurrencesError) {
      toast.error("Error al cargar ocurrencias", { description: occurrencesError.message || "No se pudieron cargar las ocurrencias" })
      console.error("Error fetching occurrences:", occurrencesError)
    }
  }, [eventsError, occurrencesError])
  
  // Cast to expected types (API returns data with relations)
  const events = eventsData as EventWithDetails[]
  const occurrences = occurrencesData as OccurrenceWithTask[]

  const createEventMutation = api.calendarEvent.create.useMutation({
    onSuccess: async () => {
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate()
      // Close the schedule dialog
      setScheduleDialogOpen(false)
      setSelectedTask(null)
      setSelectedDate(null)
      setSelectedHour(undefined)
      toast.success("Evento creado", { description: "El evento se programó correctamente" })
    },
    onError: (error) => {
      toast.error("Error al crear evento", { description: error.message || "No se pudo crear el evento" })
      console.error("Error creating event:", error)
    }
  })
  
  const updateEventMutation = api.calendarEvent.update.useMutation({
    onSuccess: async () => {
      // Invalidate queries to refresh the UI
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate()
      // Close the schedule dialog
      setScheduleDialogOpen(false)
      setEventToReschedule(null)
      setSelectedDate(null)
      setSelectedHour(undefined)
      toast.success("Evento actualizado", { description: "Los cambios se guardaron correctamente" })
    },
    onError: (error) => {
      toast.error("Error al actualizar evento", { description: error.message || "No se pudo actualizar el evento" })
      console.error("Error updating event:", error)
    }
  })

  const availableOccurrences = occurrences.filter((occurrence) => {
    const hasActiveEvent = events.some((event) => event.associatedOccurrenceId === occurrence.id && !event.isCompleted)
    return !hasActiveEvent
  })

  // Event handlers
  const handleTaskSelect = (occurrence: OccurrenceWithTask) => {
    setSelectedTask(occurrence)
  }

  const handleTaskSelectMobile = (occurrence: OccurrenceWithTask) => {
    // On mobile, show confirmation dialog
    setPendingScheduleTask(occurrence)
    setConfirmScheduleDialogOpen(true)
  }

  const handleConfirmSchedule = () => {
    if (pendingScheduleTask) {
      setSelectedTask(pendingScheduleTask)
      setMobileView("calendar")
      setPendingScheduleTask(null)
      setConfirmScheduleDialogOpen(false)
    }
  }

  const handleCancelSchedule = () => {
    setPendingScheduleTask(null)
    setConfirmScheduleDialogOpen(false)
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
        data: {
          start,
          finish,
        },
      })
    } else if (selectedTask) {
      // Create new event
      createEventMutation.mutate({
        associatedOccurrenceId: selectedTask.id,
        isFixed: false,
        start,
        finish,
      })
    }
  }

  if (eventsLoading || occurrencesLoading) {
    return <LoadingPage text="Cargando eventos y tareas..." />
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      <EventsPageHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <DesktopLayout
          availableOccurrences={availableOccurrences}
          events={events}
          onTaskSelect={handleTaskSelect}
          onTaskDragStart={handleTaskDragStart}
          onOccurrenceClick={handleOccurrenceClick}
          onTimeSlotClick={handleTimeSlotClick}
          onEventClick={handleEventClick}
          onCalendarDrop={handleCalendarDrop}
          onEventDragStart={handleEventDragStart}
        />

        <MobileLayout
          availableOccurrences={availableOccurrences}
          events={events}
          onTaskSelectMobile={handleTaskSelectMobile}
          onTaskDragStart={handleTaskDragStart}
          onOccurrenceClick={handleOccurrenceClick}
          onTimeSlotClick={handleTimeSlotClick}
          onEventClick={handleEventClick}
          onCalendarDrop={handleCalendarDrop}
          onEventDragStart={handleEventDragStart}
        />
      </div>

      {/* Dialogs */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        occurrence={selectedTask}
        event={eventToReschedule}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        onSchedule={handleSchedule}
      />

      <ConfirmScheduleDialog
        open={confirmScheduleDialogOpen}
        onOpenChange={setConfirmScheduleDialogOpen}
        occurrence={pendingScheduleTask}
        onConfirm={handleConfirmSchedule}
        onCancel={handleCancelSchedule}
      />

      <TaskDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        occurrence={detailsOccurrence}
        event={detailsEvent}
        onEventCompleted={async () => {
          await utils.calendarEvent.getMyEventsWithDetails.invalidate()
          await utils.occurrence.invalidate()
        }}
      />
    </div>
  )
}

// Wrap the content in the provider
export default function TaskCalendarPage() {
  return (
    <EventsProvider>
      <EventsPageContent />
    </EventsProvider>
  )
}
