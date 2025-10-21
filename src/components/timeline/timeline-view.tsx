"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { mockTimelineApi, type TimelineData } from "~/lib/mock-timeline-data"
import type { OccurrenceWithTask, EventWithDetails } from "~/types"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { TimelineControls, type NavigationInterval } from "./timeline-controls"
import { HelpTip } from "~/components/ui/help-tip"
import { TimelineHeader } from "./timeline-header"
import { TimelineTaskRow } from "./timeline-task-row"
import { TimelineModals, type DayCellDetails } from "./timeline-modals"
import { TimelineFooter } from "./timeline-footer"
import { 
  useIsMobile,
  useTimelineSegments,
  useTaskCellData,
  useActiveTasks
} from "./timeline-hooks"
import { 
  buildCellDataForTask, 
  getSegmentKey,
  isInSegment,
  type TimeSegment
} from "./timeline-utils"
import type { TimelineCellData } from "./timeline-cell"

interface TimelineViewProps {
  initialDays?: number
  useMockData?: boolean
}

export function TimelineView({ initialDays = 7, useMockData = true }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date("2025-01-13"))
  const [daysToShow, setDaysToShow] = useState(initialDays)
  const [dataCache, setDataCache] = useState<Map<string, TimelineData>>(new Map())
  const [navigationInterval, setNavigationInterval] = useState<NavigationInterval>("day")
  const [selectedDayCell, setSelectedDayCell] = useState<DayCellDetails | null>(null)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  // Custom hooks
  const isMobile = useIsMobile()
  const { timeSegments, visibleSegments, isCompactView, startDate, endDate } = 
    useTimelineSegments(currentDate, daysToShow, isMobile)

  // Fetch real data using tRPC
  const { data: realData, isLoading, error: timelineError } = api.timeline.getTimelineData.useQuery(
    {
      startDate: startDate!,
      endDate: endDate!,
    },
    {
      enabled: !useMockData,
    }
  )

  // Show error toast when timeline data fails to load
  useEffect(() => {
    if (timelineError) {
      toast.error("Error al cargar la línea de tiempo", { 
        description: timelineError.message || "No se pudieron cargar los datos de la línea de tiempo" 
      })
      console.error("Error fetching timeline data:", timelineError)
    }
  }, [timelineError])

  // Fetch data with caching for mock data
  useEffect(() => {
    if (!useMockData) return

    const cacheKey = `${startDate?.toISOString()}-${endDate?.toISOString()}`

    if (!dataCache.has(cacheKey)) {
      const data = mockTimelineApi.getTimelineData(startDate!, endDate!)
      setDataCache((prev) => new Map(prev).set(cacheKey, data))
    }
  }, [startDate, endDate, useMockData, dataCache])

  // Get current data from cache or real data
  const currentData = useMemo(() => {
    if (!useMockData && realData) {
      return realData
    }

    if (useMockData) {
      const cacheKey = `${startDate!.toISOString()}-${endDate!.toISOString()}`
      const data = dataCache.get(cacheKey) || { tasks: [], occurrences: [], events: [] }
      return data
    }

    return { tasks: [], occurrences: [], events: [] }
  }, [startDate, endDate, dataCache, useMockData, realData])

  // Filter tasks to only show those with activity in the segment range
  const activeTasks = useActiveTasks(currentData.tasks, currentData.occurrences, timeSegments)

  // Navigate timeline based on selected interval
  const goToPrevious = () => {
    setDirection("backward")
    const newDate = new Date(currentDate)
    switch (navigationInterval) {
      case "3hours":
        newDate.setHours(newDate.getHours() - 3)
        break
      case "day":
        newDate.setDate(newDate.getDate() - 1)
        break
      case "week":
        newDate.setDate(newDate.getDate() - 7)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    setDirection("forward")
    const newDate = new Date(currentDate)
    switch (navigationInterval) {
      case "3hours":
        newDate.setHours(newDate.getHours() + 3)
        break
      case "day":
        newDate.setDate(newDate.getDate() + 1)
        break
      case "week":
        newDate.setDate(newDate.getDate() + 7)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setDirection("forward")
    setCurrentDate(new Date())
  }

  // Handle cell click
  const handleCellClick = (
    task: typeof activeTasks[number],
    segment: TimeSegment,
    cellData: TimelineCellData
  ) => {
    // Find all occurrences for this segment
    const segmentOccurrences = currentData.occurrences.filter((occ) => 
      cellData.occurrenceIds?.includes(occ.id)
    )
    
    const segmentEvents = currentData.events.filter((event) => {
      if (!cellData.eventIds?.includes(event.id)) return false
      const eventStart = new Date(event.start)
      return isInSegment(eventStart, segment)
    })

    // Calculate total time spent
    let totalTimeSpent = 0
    segmentEvents.forEach((event) => {
      if (event.dedicatedTime) {
        totalTimeSpent += event.dedicatedTime
      }
    })

    // If no events, sum occurrence time
    if (totalTimeSpent === 0) {
      segmentOccurrences.forEach((occ) => {
        if (occ.timeConsumed) {
          totalTimeSpent += occ.timeConsumed
        }
      })
    }

    setSelectedDayCell({
      date: segment.start, // Use segment start as the reference date
      task: {
        id: task.id,
        name: task.name,
        description: task.description,
        importance: task.importance,
      },
      occurrences: segmentOccurrences, // Pass all occurrences
      events: segmentEvents,
      totalTimeSpent,
      status: cellData.status as "completed" | "skipped" | "not-completed",
    })
  }

  return (
    <div className="flex h-full flex-col gap-2 bg-background p-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <TimelineControls
        navigationInterval={navigationInterval}
        setNavigationInterval={setNavigationInterval}
        daysToShow={daysToShow}
        setDaysToShow={setDaysToShow}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        />
        <HelpTip title="Vista Línea de Tiempo" side="left">
          <p className="mb-1">
            Usa la vista para cambiar la granularidad (horas/días/meses). <br />
            También puedes ajustar qué periodo saltas al moverte con las flechas con la opción de salto. <br />
            Haz click en una celda para ver ocurrencias y eventos.
          </p>
        </HelpTip>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card shadow-sm">
        <div className="min-w-0">
          {/* Date Header - Sticky */}
          <div className="sticky top-0 z-20 bg-card">
            <TimelineHeader 
              segments={timeSegments} 
              isCompact={isCompactView}
              visibleSegments={isMobile ? visibleSegments : undefined}
            />
          </div>

          {/* Timeline Rows */}
          <motion.div
            key={currentDate.toISOString()}
            initial={{ opacity: 0, x: direction === "forward" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isLoading && !useMockData ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Cargando datos de la línea de tiempo...
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No hay tareas con actividad en este rango de fechas
              </div>
            ) : (
              activeTasks.map((task) => {
                // Build cell data for this task
                const cellDataBySegment = buildCellDataForTask(
                  task,
                  currentData.occurrences,
                  currentData.events,
                  timeSegments
                )

                return (
                  <TimelineTaskRow
                    key={task.id}
                    task={task}
                    segments={timeSegments}
                    cellDataBySegment={cellDataBySegment}
                    onCellClick={(segment, cellData) => handleCellClick(task, segment, cellData)}
                    isCompact={isCompactView}
                    visibleSegments={isMobile ? visibleSegments : undefined}
                  />
                )
              })
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer: Legend and Period Indicator */}
      <TimelineFooter currentDate={currentDate} daysToShow={daysToShow} />

      {/* Modal */}
      <TimelineModals selectedDayCell={selectedDayCell} onClose={() => setSelectedDayCell(null)} />
    </div>
  )
}
