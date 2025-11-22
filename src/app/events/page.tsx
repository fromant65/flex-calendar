"use client"

import { useEffect, useState } from "react"
import { ScheduleDialog } from "~/components/events/schedule-dialog"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { ConfirmScheduleDialog } from "~/components/events/confirm-schedule-dialog"
import { EventsProvider, useEventsContext } from "~/components/events/events-context"
import { EventsPageHeader } from "~/components/events/events-page-header"
import { DesktopLayout } from "~/components/events/desktop-layout"
import { MobileLayout } from "~/components/events/mobile-layout"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { TaskFormModal } from "~/components/tasks"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import type { EventWithDetails, OccurrenceWithTask } from "~/types"

// Modularized events page
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
    filterStartDate,
    filterEndDate,
  } = useEventsContext()

  // State for task creation modal
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

  // Get utils for query invalidation
  const utils = api.useUtils()

  // Fetch data using tRPC API
  const { data: eventsData = [], isLoading: eventsLoading, error: eventsError } = api.calendarEvent.getMyEventsWithDetails.useQuery()

  const { data: occurrencesData = [], isLoading: occurrencesLoading, error: occurrencesError } = api.occurrence.getByDateRange.useQuery({
    startDate: filterStartDate,
    endDate: filterEndDate,
  })

  // Show query errors as toasts (type-safe)
  useEffect(() => {
    if (eventsError) {
      toast.error("Error al cargar eventos", { description: eventsError.message || "No se pudieron cargar los eventos" })
      //console.error("Error fetching events:", eventsError)
    }
    if (occurrencesError) {
      toast.error("Error al cargar ocurrencias", { description: occurrencesError.message || "No se pudieron cargar las ocurrencias" })
      //console.error("Error fetching occurrences:", occurrencesError)
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
      //console.error("Error creating event:", error)
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
      //console.error("Error updating event:", error)
    }
  })

  // Only occurrences that are active (Pending or In Progress) and without an active event
  const availableOccurrences = occurrences.filter((occurrence) => {
    const isActiveStatus = occurrence.status === "Pending" || occurrence.status === "In Progress"
    const hasActiveEvent = events.some((event) => event.associatedOccurrenceId === occurrence.id && !event.isCompleted)
    return isActiveStatus && !hasActiveEvent
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
    // Don't allow dragging of fixed events, completed events, or events tied to skipped occurrences
    if (event.isFixed) return
    if (event.isCompleted) return
    if (event.occurrence?.status === "Skipped") return

    setDraggedEvent(event)
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

  const handleSchedule = (start: Date, finish: Date, context?: string) => {
    
    if (eventToReschedule) {
      updateEventMutation.mutate({
        id: eventToReschedule.id,
        data: {
          start,
          finish,
          ...(context ? { context } : {}),
        },
      })
    } else if (selectedTask) {
      // Create new event
      createEventMutation.mutate({
        associatedOccurrenceId: selectedTask.id,
        isFixed: false,
        start,
        finish,
        ...(context ? { context } : {}),
      })
    }
  }

  // Only show full-page loading on initial load (when there's no data yet)
  const isInitialLoad = (eventsLoading && events.length === 0) || (occurrencesLoading && occurrences.length === 0)
  
  if (isInitialLoad) {
    return <LoadingPage text="Cargando eventos y tareas..." />
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <EventsPageHeader onCreateTaskClick={() => setIsTaskFormOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 relative">
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

      {/* Task Form Modal */}
      <TaskFormModal
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSuccess={async () => {
          setIsTaskFormOpen(false)
          // Invalidate occurrences to refresh the matrix with the new task
          await utils.occurrence.invalidate()
          toast.success("Tarea creada", { description: "La tarea se creó correctamente y aparecerá en la matriz" })
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
