"use client"

import { api } from "~/trpc/react"
import { UrgentTasksList } from "~/components/dashboard/urgent-tasks-list"
import { ImportantTasksList } from "~/components/dashboard/important-tasks-list"
import { DayWeekEvents } from "~/components/dashboard/events-list"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { TaskConfirmationDialogs } from "~/components/dashboard/task-confirmation-dialogs"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { useState } from "react"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"
import { toast } from "sonner"

interface DashboardClientProps {
  userName: string
  userEmail: string
}

export function DashboardClient({ userName, userEmail }: DashboardClientProps) {
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceWithTask | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false)
  const [occurrenceToComplete, setOccurrenceToComplete] = useState<OccurrenceWithTask | null>(null)
  const [occurrenceToSkip, setOccurrenceToSkip] = useState<OccurrenceWithTask | null>(null)

  // Fetch data
  const { data: urgentOccurrences = [], isLoading: urgentLoading } = api.task.getByUrgency.useQuery()
  const { data: importantOccurrences = [], isLoading: importantLoading } = api.task.getByImportance.useQuery()
  const { data: todayEvents = [], isLoading: todayLoading } = api.calendarEvent.getTodayEvents.useQuery()
  const { data: weekEvents = [], isLoading: weekLoading } = api.calendarEvent.getWeekEvents.useQuery()
  
  const utils = api.useUtils()

  const completeOccurrenceMutation = api.occurrence.complete.useMutation({
    onSuccess: async () => {
      toast.success("¡Tarea completada!", {
        description: "La tarea ha sido marcada como completada",
      })
      // Invalidate all queries to refresh data
      await utils.task.getByUrgency.invalidate()
      await utils.task.getByImportance.invalidate()
      await utils.calendarEvent.getTodayEvents.invalidate()
      await utils.calendarEvent.getWeekEvents.invalidate()
      setConfirmCompleteOpen(false)
      setOccurrenceToComplete(null)
    },
    onError: (error) => {
      toast.error("Error al completar tarea", {
        description: error.message || "Hubo un problema al completar la tarea",
      })
      console.error("Error completing occurrence:", error)
    }
  })

  const skipOccurrenceMutation = api.occurrence.skip.useMutation({
    onSuccess: async () => {
      toast.info("Tarea saltada", {
        description: "La tarea ha sido marcada como saltada",
      })
      // Invalidate all queries to refresh data
      await utils.task.getByUrgency.invalidate()
      await utils.task.getByImportance.invalidate()
      await utils.calendarEvent.getTodayEvents.invalidate()
      await utils.calendarEvent.getWeekEvents.invalidate()
      setConfirmSkipOpen(false)
      setOccurrenceToSkip(null)
    },
    onError: (error) => {
      toast.error("Error al saltar tarea", {
        description: error.message || "Hubo un problema al saltar la tarea",
      })
      console.error("Error skipping occurrence:", error)
    }
  })

  const handleCompleteTask = (occurrence: OccurrenceWithTask) => {
    setOccurrenceToComplete(occurrence)
    setConfirmCompleteOpen(true)
  }

  const handleSkipTask = (occurrence: OccurrenceWithTask) => {
    setOccurrenceToSkip(occurrence)
    setConfirmSkipOpen(true)
  }

  const confirmCompleteTask = () => {
    if (!occurrenceToComplete) return
    completeOccurrenceMutation.mutate({ id: occurrenceToComplete.id })
  }

  const confirmSkipTask = () => {
    if (!occurrenceToSkip) return
    skipOccurrenceMutation.mutate({ id: occurrenceToSkip.id })
  }

  const handleTaskClick = (occurrence: OccurrenceWithTask) => {
    setSelectedOccurrence(occurrence)
    setSelectedEvent(null)
    setDetailsModalOpen(true)
  }

  const handleEventClick = (event: EventWithDetails) => {
    setSelectedEvent(event)
    setSelectedOccurrence(null)
    setDetailsModalOpen(true)
  }

  const handleEventCompleted = async () => {
    // Invalidate all queries to refresh data
    await utils.task.getByUrgency.invalidate()
    await utils.task.getByImportance.invalidate()
    await utils.calendarEvent.getTodayEvents.invalidate()
    await utils.calendarEvent.getWeekEvents.invalidate()
  }

  if (urgentLoading || importantLoading || todayLoading || weekLoading) {
    return <LoadingPage text="Cargando dashboard..." />
  }

  // Take only top 5 most urgent/important tasks and cast to correct type
  const topUrgentOccurrences = urgentOccurrences.slice(0, 5) as OccurrenceWithTask[]
  const topImportantOccurrences = importantOccurrences.slice(0, 5) as OccurrenceWithTask[]
  const todayEventsTyped = todayEvents as EventWithDetails[]
  const weekEventsTyped = weekEvents as EventWithDetails[]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenido, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6 flex-1 overflow-y-auto">
        {/* Tareas Grid */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 mb-6">
          {/* Tareas Urgentes */}
          <div className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Tareas Urgentes</h2>
              {topUrgentOccurrences.length > 0 && (
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                  {topUrgentOccurrences.length}
                </span>
              )}
            </div>
            <UrgentTasksList 
              occurrences={topUrgentOccurrences} 
              onTaskClick={handleTaskClick}
              onCompleteTask={handleCompleteTask}
              onSkipTask={handleSkipTask}
            />
          </div>

          {/* Tareas Importantes */}
          <div className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Tareas Importantes</h2>
              {topImportantOccurrences.length > 0 && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {topImportantOccurrences.length}
                </span>
              )}
            </div>
            <ImportantTasksList 
              occurrences={topImportantOccurrences} 
              onTaskClick={handleTaskClick}
              onCompleteTask={handleCompleteTask}
              onSkipTask={handleSkipTask}
            />
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Próximos Eventos</h2>
          <DayWeekEvents
            todayEvents={todayEventsTyped}
            weekEvents={weekEventsTyped}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Task/Event Details Modal */}
      <TaskDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        occurrence={selectedOccurrence}
        event={selectedEvent}
        onEventCompleted={handleEventCompleted}
      />

      {/* Task Confirmation Dialogs */}
      <TaskConfirmationDialogs
        confirmCompleteOpen={confirmCompleteOpen}
        onConfirmCompleteChange={setConfirmCompleteOpen}
        occurrenceToComplete={occurrenceToComplete}
        onConfirmComplete={confirmCompleteTask}
        isCompleting={completeOccurrenceMutation.isPending}
        confirmSkipOpen={confirmSkipOpen}
        onConfirmSkipChange={setConfirmSkipOpen}
        occurrenceToSkip={occurrenceToSkip}
        onConfirmSkip={confirmSkipTask}
        isSkipping={skipOccurrenceMutation.isPending}
      />
    </div>
  )
}
