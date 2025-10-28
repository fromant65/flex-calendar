"use client"

import { api } from "~/trpc/react"
import { UrgentTasksList } from "~/components/dashboard/urgent-tasks-list"
import { ImportantTasksList } from "~/components/dashboard/important-tasks-list"
import { DayWeekEvents } from "~/components/dashboard/events-list"
import { CalendarViewComponent } from "~/components/events/calendar-view"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { TaskConfirmationDialogs } from "~/components/dashboard/task-confirmation-dialogs"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { useState, useEffect } from "react"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"
import { toast } from "sonner"
import HelpTip from "../ui/help-tip"

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
  const [eventsView, setEventsView] = useState<"list" | "calendar">("list")
  const [calendarView, setCalendarView] = useState<import("~/types").CalendarView>("week")

  // Fetch data
  const { data: urgentOccurrences = [], isLoading: urgentLoading, error: urgentError } = api.task.getByUrgency.useQuery()
  const { data: importantOccurrences = [], isLoading: importantLoading, error: importantError } = api.task.getByImportance.useQuery()
  const { data: todayEvents = [], isLoading: todayLoading, error: todayError } = api.calendarEvent.getTodayEvents.useQuery()
  const { data: weekEvents = [], isLoading: weekLoading, error: weekError } = api.calendarEvent.getWeekEvents.useQuery()

  // Show toast when there's an error
  useEffect(() => {
    if (urgentError) {
      toast.error("Error al cargar tareas urgentes", { 
        description: urgentError.message || "No se pudieron cargar las tareas urgentes" 
      })
      console.error("Error fetching urgent tasks:", urgentError)
    }
    if (importantError) {
      toast.error("Error al cargar tareas importantes", { 
        description: importantError.message || "No se pudieron cargar las tareas importantes" 
      })
      console.error("Error fetching important tasks:", importantError)
    }
    if (todayError) {
      toast.error("Error al cargar eventos de hoy", { 
        description: todayError.message || "No se pudieron cargar los eventos de hoy" 
      })
      console.error("Error fetching today events:", todayError)
    }
    if (weekError) {
      toast.error("Error al cargar eventos de la semana", { 
        description: weekError.message || "No se pudieron cargar los eventos de la semana" 
      })
      console.error("Error fetching week events:", weekError)
    }
  }, [urgentError, importantError, todayError, weekError])
  
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

  const confirmCompleteTask = (completedAt?: Date) => {
    if (!occurrenceToComplete) return
    completeOccurrenceMutation.mutate({ 
      id: occurrenceToComplete.id,
      completedAt 
    })
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
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">Tareas Urgentes</h2>
                <HelpTip title="Tareas urgentes">
                  Estas son tus tareas con mayor puntuación de urgencia. Se ordenan por prioridad (1 = más urgente). <br />
                  Puedes tocar el título para ver los detalles de la tarea. <br />
                  Desde los botones de acción puedes marcar como completada o saltar. <br />
                  Una tarea salteada será considerada incompleta.
                </HelpTip>
              </div>
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">Tareas Importantes</h2>
                <HelpTip title="Tareas importantes">
                  Estas son tus tareas con mayor valor de importancia (mayor a 5). <br />
                  Puedes tocar el título para ver los detalles de la tarea. <br />
                  Desde los botones de acción puedes marcar como completada o saltar. <br />
                  Las tareas importantes no urgentes son ideales para planificación a largo plazo.
                </HelpTip>
              </div>
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
          <div className="flex flex-col gap-3 mb-4">
            {/* Title and Help - Always on top */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Próximos Eventos</h2>
              <HelpTip title="Próximos Eventos">
                Esta lista muestra eventos programados. Puedes tocar un evento para abrir sus detalles,
                marcarlo como completado, o ver cuánto tiempo se dedicó. Los eventos pueden estar vinculados
                a tareas (aparecerá el nombre de la tarea) y pueden ser fijos o flexibles.
              </HelpTip>
            </div>
            
            {/* View Buttons - Separate row on mobile, inline on desktop */}
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-sm text-muted-foreground">Vista:</span>
              <div className="flex items-center gap-2 border border-border rounded-md p-1 bg-background/50">
                <button
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all cursor-pointer ${
                    eventsView === "list" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setEventsView("list")}
                >
                  Lista
                </button>
                <button
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all cursor-pointer ${
                    eventsView === "calendar" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setEventsView("calendar")}
                >
                  Calendario
                </button>
              </div>
            </div>
          </div>

          {/* Content: list or calendar */}
          <div className="min-h-[200px]">
            {eventsView === "list" ? (
              <DayWeekEvents
                todayEvents={todayEventsTyped}
                weekEvents={weekEventsTyped}
                onEventClick={handleEventClick}
              />
            ) : (
              // Calendar: use week view by default on larger screens, hide heavy calendar on very small screens
              <div className="w-full h-[420px] sm:h-[520px]">
                <CalendarViewComponent
                  events={[...todayEventsTyped, ...weekEventsTyped]}
                  view={calendarView}
                  onViewChange={(v) => setCalendarView(v)}
                  onTimeSlotClick={(date, hour) => {
                    // open schedule dialog via modal flow used in events page is not available here;
                    // Instead, reuse event click to show details if clicking an existing event, otherwise noop
                    // We'll call handleEventClick for existing events via onEventClick below.
                  }}
                  onEventClick={handleEventClick}
                  onDrop={(date, hour) => {
                    // Dropping scheduling isn't available from dashboard; show info toast
                    toast("Arrastra para reprogramar desde la página de eventos.")
                  }}
                  onEventDragStart={() => { /* noop on dashboard */ }}
                />
              </div>
            )}
          </div>
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
