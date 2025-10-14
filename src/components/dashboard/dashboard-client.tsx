"use client"

import { api } from "~/trpc/react"
import { UrgentTasksList } from "~/components/dashboard/urgent-tasks-list"
import { ImportantTasksList } from "~/components/dashboard/important-tasks-list"
import { DayWeekEvents } from "~/components/dashboard/events-list"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { useState } from "react"
import type { OccurrenceWithTask, EventWithDetails } from "~/lib/types"

interface DashboardClientProps {
  userName: string
  userEmail: string
}

export function DashboardClient({ userName, userEmail }: DashboardClientProps) {
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceWithTask | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // Fetch data
  const { data: urgentOccurrences = [], isLoading: urgentLoading } = api.task.getByUrgency.useQuery()
  const { data: importantOccurrences = [], isLoading: importantLoading } = api.task.getByImportance.useQuery()
  const { data: todayEvents = [], isLoading: todayLoading } = api.calendarEvent.getTodayEvents.useQuery()
  const { data: weekEvents = [], isLoading: weekLoading } = api.calendarEvent.getWeekEvents.useQuery()
  
  const utils = api.useUtils()

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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-foreground">
            Bienvenido, <span className="text-primary">{userName}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">{userEmail}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Tareas Urgentes */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Tareas Urgentes</h2>
              {topUrgentOccurrences.length > 0 && (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  {topUrgentOccurrences.length} {topUrgentOccurrences.length === 1 ? 'tarea' : 'tareas'}
                </span>
              )}
            </div>
            <UrgentTasksList 
              occurrences={topUrgentOccurrences} 
              onTaskClick={handleTaskClick}
            />
          </div>

          {/* Tareas Importantes */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Tareas Importantes</h2>
              {topImportantOccurrences.length > 0 && (
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {topImportantOccurrences.length} {topImportantOccurrences.length === 1 ? 'tarea' : 'tareas'}
                </span>
              )}
            </div>
            <ImportantTasksList 
              occurrences={topImportantOccurrences} 
              onTaskClick={handleTaskClick}
            />
          </div>
        </div>

        {/* Secondary Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Próximos Eventos */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Próximos Eventos</h2>
            <DayWeekEvents
              todayEvents={todayEventsTyped}
              weekEvents={weekEventsTyped}
              onEventClick={handleEventClick}
            />
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
    </main>
  )
}
