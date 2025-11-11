"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { mockTimelineApi, type TimelineData } from "~/lib/mock-timeline-data"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { TimelinePageHeader } from "./timeline-page-header"
import type { NavigationInterval } from "./timeline-controls"
import type { TimelineFilters as TimelineFiltersType } from "./timeline-filters"
import { TimelineHeader } from "./timeline-header"
import { TimelineTaskRow } from "./timeline-task-row"
import { TimelineModals, type DayCellDetails } from "./timeline-modals"
import { TimelineFooter } from "./timeline-footer"
import { 
  useIsMobile,
  useTimelineSegments,
  useActiveTasks
} from "./timeline-hooks"
import { 
  buildCellDataForTask,
  isInSegment,
  type TimeSegment
} from "./timeline-utils"
import type { TimelineCellData } from "./timeline-cell"

interface TimelineViewProps {
  initialDays?: number
  useMockData?: boolean
}

export function TimelineView({ initialDays = 7, useMockData = true }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [daysToShow, setDaysToShow] = useState(initialDays)
  const [dataCache, setDataCache] = useState<TimelineData | null>(null)
  const [cachedRange, setCachedRange] = useState<{ start: Date; end: Date } | null>(null)
  const [navigationInterval, setNavigationInterval] = useState<NavigationInterval>("day")
  const [selectedDayCell, setSelectedDayCell] = useState<DayCellDetails | null>(null)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [filters, setFilters] = useState<TimelineFiltersType>({
    searchQuery: "",
    taskTypeFilter: "all",
    priorityFilter: "all",
    statusFilter: "all",
  })

  // Custom hooks
  const isMobile = useIsMobile()
  const { timeSegments, visibleSegments, isCompactView, startDate, endDate } = 
    useTimelineSegments(currentDate, daysToShow, isMobile)

  // Calculate extended range for caching (current period + 4x forward + 4x backward)
  const extendedRange = useMemo(() => {
    if (!startDate || !endDate) return null
    
    const periodDuration = endDate.getTime() - startDate.getTime()
    const extendedStart = new Date(startDate.getTime() - (periodDuration * 4))
    const extendedEnd = new Date(endDate.getTime() + (periodDuration * 4))
    
    return { start: extendedStart, end: extendedEnd }
  }, [startDate, endDate])

  // Check if current visible range is covered by cached data
  const isRangeCovered = useMemo(() => {
    if (!startDate || !endDate || !cachedRange) return false
    
    return (
      startDate.getTime() >= cachedRange.start.getTime() &&
      endDate.getTime() <= cachedRange.end.getTime()
    )
  }, [startDate, endDate, cachedRange])

  // Determine if we should fetch new data
  const shouldFetch = !useMockData && !isRangeCovered && !!extendedRange

  // Fetch real data using tRPC with extended range
  const { data: realData, isLoading, error: timelineError } = api.timeline.getTimelineData.useQuery(
    {
      startDate: extendedRange?.start ?? new Date(),
      endDate: extendedRange?.end ?? new Date(),
    },
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Never consider data stale
      gcTime: Infinity, // Never garbage collect
    }
  )

  // Update cache when new data arrives
  useEffect(() => {
    if (realData && extendedRange && !useMockData) {
      setDataCache(realData)
      setCachedRange(extendedRange)
    }
  }, [realData, extendedRange, useMockData])

  // Show error toast when timeline data fails to load
  useEffect(() => {
    if (timelineError) {
      toast.error("Error al cargar la línea de tiempo", { 
        description: timelineError.message || "No se pudieron cargar los datos de la línea de tiempo" 
      })
      console.error("Error fetching timeline data:", timelineError)
    }
  }, [timelineError])

  // Fetch mock data with extended range caching
  useEffect(() => {
    if (!useMockData || !extendedRange || isRangeCovered) return

    const data = mockTimelineApi.getTimelineData(extendedRange.start, extendedRange.end)
    setDataCache(data)
    setCachedRange(extendedRange)
  }, [useMockData, extendedRange, isRangeCovered])

  // Get current data filtered to visible range
  const currentData = useMemo(() => {
    if (!startDate || !endDate || !dataCache) {
      return { tasks: [], occurrences: [], events: [] }
    }

    // Filter data to visible range
    const filteredOccurrences = dataCache.occurrences.filter((occ) => {
      const occDate = new Date(occ.startDate)
      return occDate >= startDate && occDate <= endDate
    })
    
    const filteredEvents = dataCache.events.filter((event) => {
      const eventStart = new Date(event.start)
      return eventStart >= startDate && eventStart <= endDate
    })
    
    // Get unique task IDs from filtered occurrences
    const taskIds = new Set(filteredOccurrences.map(occ => occ.associatedTaskId))
    const filteredTasks = dataCache.tasks.filter(task => taskIds.has(task.id))
    
    return {
      tasks: filteredTasks,
      occurrences: filteredOccurrences,
      events: filteredEvents,
    }
  }, [startDate, endDate, dataCache])

  // Filter tasks to only show those with activity in the segment range
  const activeTasks = useActiveTasks(currentData.tasks, currentData.occurrences, timeSegments)

  // Apply filters to active tasks
  const filteredTasks = useMemo(() => {
    let filtered = activeTasks

    // Search by name
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((task) => 
        task.name.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    }

    // Filter by task type
    if (filters.taskTypeFilter !== "all") {
      filtered = filtered.filter((task) => task.taskType === filters.taskTypeFilter)
    }

    // Filter by priority (Eisenhower matrix)
    if (filters.priorityFilter !== "all") {
      filtered = filtered.filter((task) => {
        const taskOccurrences = currentData.occurrences.filter(
          (occ) => occ.associatedTaskId === task.id
        )
        
        // Calculate if task has occurrences in the selected quadrant
        return taskOccurrences.some((occ) => {
          const importance = task.importance || 0
          const urgency = occ.urgency || 0
          const isImportant = importance >= 6
          const isUrgent = urgency >= 6
          
          switch (filters.priorityFilter) {
            case "urgent-important":
              return isUrgent && isImportant
            case "not-urgent-important":
              return !isUrgent && isImportant
            case "urgent-not-important":
              return isUrgent && !isImportant
            case "not-urgent-not-important":
              return !isUrgent && !isImportant
            default:
              return false
          }
        })
      })
    }

    // Filter by occurrence status
    if (filters.statusFilter !== "all") {
      filtered = filtered.filter((task) => {
        const taskOccurrences = currentData.occurrences.filter(
          (occ) => occ.associatedTaskId === task.id
        )

        switch (filters.statusFilter) {
          case "has-pending":
            return taskOccurrences.some((occ) => occ.status === "Pending")
          case "has-completed":
            return taskOccurrences.some((occ) => occ.status === "Completed")
          case "has-skipped":
            return taskOccurrences.some((occ) => occ.status === "Skipped")
          case "all-completed":
            return taskOccurrences.length > 0 && taskOccurrences.every((occ) => occ.status === "Completed")
          default:
            return true
        }
      })
    }

    return filtered
  }, [activeTasks, filters, currentData.occurrences])

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
      {/* Unified Header: Controls, Filters & Help */}
      <TimelinePageHeader
        navigationInterval={navigationInterval}
        setNavigationInterval={setNavigationInterval}
        daysToShow={daysToShow}
        setDaysToShow={setDaysToShow}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        filters={filters}
        onFiltersChange={setFilters}
        totalTasks={activeTasks.length}
        filteredCount={filteredTasks.length}
      />

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
            ) : filteredTasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                {activeTasks.length === 0 
                  ? "No hay tareas con actividad en este rango de fechas"
                  : "No hay tareas que coincidan con los filtros aplicados"}
              </div>
            ) : (
              filteredTasks.map((task) => {
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
