"use client"

import { CalendarViewComponent } from "~/components/events/calendar-view"
import { EisenhowerMatrix } from "~/components/events/eisenhower-matrix"
import { ScheduleDialog } from "~/components/events/schedule-dialog"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { api } from "~/trpc/react"
import type { CalendarView, EventWithDetails, OccurrenceWithTask } from "~/types"
import { useState, useRef, useEffect } from "react"
import { GripVertical } from "lucide-react"

export default function TaskCalendarPage() {
  const [calendarView, setCalendarView] = useState<CalendarView>("week")
  const [selectedTask, setSelectedTask] = useState<OccurrenceWithTask | null>(null)
  const [draggedTask, setDraggedTask] = useState<OccurrenceWithTask | null>(null)
  const [draggedEvent, setDraggedEvent] = useState<EventWithDetails | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsOccurrence, setDetailsOccurrence] = useState<OccurrenceWithTask | null>(null)
  const [detailsEvent, setDetailsEvent] = useState<EventWithDetails | null>(null)
  const [eventToReschedule, setEventToReschedule] = useState<EventWithDetails | null>(null)
  
  // Resizable panel state - 40% for matrix (2/5), 60% for calendar (3/5)
  const [leftWidth, setLeftWidth] = useState(40)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
  const { data: eventsData = [], isLoading: eventsLoading } = api.calendarEvent.getMyEventsWithDetails.useQuery()
  const { data: occurrencesData = [], isLoading: occurrencesLoading } = api.occurrence.getByDateRange.useQuery({
    startDate: startOfWeek,
    endDate: endOfWeek,
  })
  
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
    }
  })

  const availableOccurrences = occurrences.filter((occurrence) => {
    const hasActiveEvent = events.some((event) => event.associatedOccurrenceId === occurrence.id && !event.isCompleted)
    return !hasActiveEvent
  })

  // Handle resizable divider
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80)
      setLeftWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  //console.log("All Occurrences:", occurrences)
  //console.log("Available Occurrences:", availableOccurrences)

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
        data: {
          start,
          finish,
        }
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
    // State cleanup is now handled in mutation onSuccess callbacks
  }

  if(eventsLoading || occurrencesLoading) {
    return <LoadingPage text="Cargando eventos y tareas..." />
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card flex-shrink-0">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Task Planner</h1>
          <p className="text-sm text-muted-foreground">Organize and schedule your tasks efficiently</p>
        </div>
      </header>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Eisenhower Matrix */}
        <div 
          className="border-r border-border bg-card overflow-hidden flex-shrink-0"
          style={{ width: `${leftWidth}%` }}
        >
          <EisenhowerMatrix
            occurrences={availableOccurrences}
            onTaskSelect={handleTaskSelect}
            onTaskDragStart={handleTaskDragStart}
            onTaskClick={handleOccurrenceClick}
            selectedTaskId={selectedTask?.id}
          />
        </div>

        {/* Resizable Divider */}
        <div
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex-shrink-0 relative group transition-colors"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="bg-border group-hover:bg-primary/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
          </div>
        </div>

        {/* Right Panel: Calendar */}
        <div className="flex-1 bg-background overflow-hidden">
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
        onEventCompleted={async () => {
          // Refetch data after completing event using the utils instance
          await utils.calendarEvent.getMyEventsWithDetails.invalidate()
          await utils.occurrence.invalidate()
        }}
      />
    </div>
  )
}
