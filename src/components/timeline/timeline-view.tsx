"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { mockTimelineApi } from "~/lib/mock-timeline-data"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import type { TimelineGetTimelineDataOutput } from "~/server/api/routers/derived-endpoint-types"
import { TimelinePageHeader } from "./timeline-page-header"
import type { NavigationInterval } from "./timeline-controls"
import type { UnifiedFilters } from "~/types/filters"
import { defaultFilters } from "~/types/filters"
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

type MockTimelineData = ReturnType<typeof mockTimelineApi.getTimelineData>

type TimelineTaskLike = {
  id: number
  name: string
  description?: string | null
  importance?: number
  isActive?: boolean
  status?: string
  taskType?: string
  isFixed?: boolean
  recurrence?: { maxOccurrences?: number | null } | null
}

type TimelineOccurrenceLike = {
  id: number
  status: string
  urgency?: number | null
  taskId?: number
  associatedTaskId?: number
  slotStartAt?: Date | null
  startDate?: Date
  createdAt?: Date
  dueAt?: Date | null
  limitDate?: Date | null
  tentativeAt?: Date | null
  targetDate?: Date | null
  timeSpentMinutes?: number | null
  timeConsumed?: number | null
}

type TimelineEventLike = {
  id: number
  start: Date
  dedicatedTime?: number | null
}

type TimelineCacheData = {
  tasks: TimelineTaskLike[]
  occurrences: TimelineOccurrenceLike[]
  events: TimelineEventLike[]
}

type TimelineTask = TimelineGetTimelineDataOutput["tasks"][number]
type TimelineOccurrence = TimelineGetTimelineDataOutput["occurrences"][number]
type TimelineEvent = TimelineGetTimelineDataOutput["events"][number]

const toTimelineCacheData = (data: TimelineGetTimelineDataOutput | MockTimelineData): TimelineCacheData => ({
  tasks: data.tasks.map((task) => ({ ...task })),
  occurrences: data.occurrences.map((occurrence) => ({ ...occurrence })),
  events: data.events.map((event) => ({ ...event })),
})

const normalizeOccurrenceStatus = (status: string): string => {
  return status.toLowerCase().replace(/\s+/g, "_")
}

const getOccurrenceTaskId = (occ: TimelineOccurrenceLike): number | null => {
  if (typeof occ.taskId === "number") return occ.taskId
  if (typeof occ.associatedTaskId === "number") return occ.associatedTaskId
  return null
}

const getOccurrenceStart = (occ: TimelineOccurrenceLike): Date | null => {
  const value = occ.slotStartAt ?? occ.startDate ?? occ.createdAt
  return value instanceof Date ? value : value ? new Date(value as string) : null
}

const getOccurrenceDueAt = (occ: TimelineOccurrenceLike): Date | null => {
  const value = occ.dueAt ?? occ.limitDate
  return value instanceof Date ? value : value ? new Date(value as string) : null
}

const getOccurrenceTentativeAt = (occ: TimelineOccurrenceLike): Date | null => {
  const value = occ.tentativeAt ?? occ.targetDate
  return value instanceof Date ? value : value ? new Date(value as string) : null
}

const getOccurrenceTimeSpent = (occ: TimelineOccurrenceLike): number => {
  if (typeof occ.timeSpentMinutes === "number") return occ.timeSpentMinutes
  if (typeof occ.timeConsumed === "number") return occ.timeConsumed
  return 0
}

const deriveTaskType = (task: TimelineTaskLike): string => {
  const explicitType = task.taskType
  if (typeof explicitType === "string" && explicitType.length > 0) return explicitType

  const isFixed = task.isFixed === true
  const recurrence = task.recurrence as { maxOccurrences?: number | null } | undefined
  const hasRecurrence = !!recurrence
  const maxOccurrences = recurrence?.maxOccurrences ?? null

  if (isFixed && hasRecurrence) return "Fija Repetitiva"
  if (isFixed) return "Fija Única"
  if (typeof maxOccurrences === "number" && maxOccurrences > 1) return "Recurrente Finita"
  if (hasRecurrence) return "Hábito"
  return "Única"
}

export function TimelineView({ initialDays = 7, useMockData = true }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [daysToShow, setDaysToShow] = useState(initialDays)
  const [dataCache, setDataCache] = useState<TimelineCacheData | null>(null)
  const [cachedRange, setCachedRange] = useState<{ start: Date; end: Date } | null>(null)
  const [navigationInterval, setNavigationInterval] = useState<NavigationInterval>("day")
  const [selectedDayCell, setSelectedDayCell] = useState<DayCellDetails | null>(null)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [filters, setFilters] = useState<UnifiedFilters>(defaultFilters)

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
      setDataCache(toTimelineCacheData(realData))
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
    setDataCache(toTimelineCacheData(data))
    setCachedRange(extendedRange)
  }, [useMockData, extendedRange, isRangeCovered])

  // Get current data filtered to visible range
  const currentData = useMemo(() => {
    if (!startDate || !endDate || !dataCache) {
      return { tasks: [], occurrences: [], events: [] }
    }

    // Filter data to visible range
    const filteredOccurrences = dataCache.occurrences.filter((occ) => {
      const occDate = getOccurrenceStart(occ)
      if (!occDate) return false
      return occDate >= startDate && occDate <= endDate
    })
    
    const filteredEvents = dataCache.events.filter((event) => {
      const eventStart = new Date(event.start)
      return eventStart >= startDate && eventStart <= endDate
    })
    
    // Get unique task IDs from filtered occurrences
    const normalizedTaskIds = new Set(
      filteredOccurrences
        .map((occ) => getOccurrenceTaskId(occ))
        .filter((taskId): taskId is number => typeof taskId === "number")
    )
    const filteredTasks = dataCache.tasks.filter(task => normalizedTaskIds.has(task.id))
    
    return {
      tasks: filteredTasks,
      occurrences: filteredOccurrences,
      events: filteredEvents,
    }
  }, [startDate, endDate, dataCache])

  // Filter tasks to only show those with activity in the segment range
  const activeTasks = useActiveTasks(
    currentData.tasks as TimelineTask[],
    currentData.occurrences as TimelineOccurrence[],
    timeSegments
  )

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

    // Filter by task type - multi-select support
    if (filters.taskTypesFilter.length > 0) {
      filtered = filtered.filter((task) => {
        const taskType = deriveTaskType(task) as (typeof filters.taskTypesFilter)[number]
        return filters.taskTypesFilter.includes(taskType)
      })
    } else if (filters.taskTypeFilter !== "all") {
      // Fallback to single select
      filtered = filtered.filter((task) => {
        const taskType = deriveTaskType(task) as typeof filters.taskTypeFilter
        return taskType === filters.taskTypeFilter
      })
    }

    // Filter by priority (Eisenhower matrix) - multi-select support
    if (filters.prioritiesFilter.length > 0) {
      filtered = filtered.filter((task) => {
        const taskOccurrences = currentData.occurrences.filter(
          (occ) => getOccurrenceTaskId(occ) === task.id
        )
        
        // Calculate if task has occurrences in any of the selected quadrants
        return taskOccurrences.some((occ) => {
          const importance = task.importance || 0
          const urgency = occ.urgency || 0
          const isImportant = importance >= 6
          const isUrgent = urgency >= 6
          
          return filters.prioritiesFilter.some((priority) => {
            switch (priority) {
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
      })
    } else if (filters.priorityFilter !== "all") {
      // Fallback to single select
      filtered = filtered.filter((task) => {
        const taskOccurrences = currentData.occurrences.filter(
          (occ) => getOccurrenceTaskId(occ) === task.id
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

    // Filter by task occurrence status - multi-select support
    if (filters.taskOccurrenceStatusesFilter.length > 0) {
      filtered = filtered.filter((task) => {
        const taskOccurrences = currentData.occurrences.filter(
          (occ) => getOccurrenceTaskId(occ) === task.id
        )
        const selectedStatuses = filters.taskOccurrenceStatusesFilter.map(normalizeOccurrenceStatus)
        return taskOccurrences.some((occ) => selectedStatuses.includes(normalizeOccurrenceStatus(occ.status)))
      })
    } else if (filters.taskOccurrenceStatusFilter !== "all") {
      // Fallback to single select
      filtered = filtered.filter((task) => {
        const taskOccurrences = currentData.occurrences.filter(
          (occ) => getOccurrenceTaskId(occ) === task.id
        )
        const selectedStatus = normalizeOccurrenceStatus(filters.taskOccurrenceStatusFilter)
        return taskOccurrences.some((occ) => normalizeOccurrenceStatus(occ.status) === selectedStatus)
      })
    }

    // Filter by active status
    if (filters.activeStatusFilter === "active") {
      filtered = filtered.filter((task) => {
        return task.isActive === true
      })
    } else if (filters.activeStatusFilter === "inactive") {
      filtered = filtered.filter((task) => {
        return task.isActive === false
      })
    }

    return filtered
  }, [activeTasks, filters, currentData.occurrences])

  // Apply sorting to filtered tasks
  const sortedFilteredTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    const taskOccurrences = new Map(
      currentData.occurrences
        .reduce((acc, occ) => {
          const taskId = getOccurrenceTaskId(occ)
          if (typeof taskId !== "number") return acc

          if (!acc.has(taskId)) {
            acc.set(taskId, [])
          }
          acc.get(taskId)!.push(occ)
          return acc
        }, new Map<number, typeof currentData.occurrences>())
    )

    switch (filters.sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "type":
        return sorted.sort((a, b) => {
          const aType = deriveTaskType(a)
          const bType = deriveTaskType(b)
          return aType.localeCompare(bType)
        })
      case "closest-target":
        return sorted.sort((a, b) => {
          const aOccs = taskOccurrences.get(a.id) ?? []
          const bOccs = taskOccurrences.get(b.id) ?? []
          const aDate = aOccs.map((o) => getOccurrenceTentativeAt(o) ?? getOccurrenceDueAt(o)).find(Boolean) ?? null
          const bDate = bOccs.map((o) => getOccurrenceTentativeAt(o) ?? getOccurrenceDueAt(o)).find(Boolean) ?? null
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          return aDate.getTime() - bDate.getTime()
        })
      case "closest-limit":
        return sorted.sort((a, b) => {
          const aOccs = taskOccurrences.get(a.id) ?? []
          const bOccs = taskOccurrences.get(b.id) ?? []
          const aDate = aOccs.map((o) => getOccurrenceDueAt(o)).find(Boolean) ?? null
          const bDate = bOccs.map((o) => getOccurrenceDueAt(o)).find(Boolean) ?? null
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          return aDate.getTime() - bDate.getTime()
        })
      case "importance":
        return sorted.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
      default:
        return sorted
    }
  }, [filteredTasks, filters.sortBy, currentData.occurrences])

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
        totalTimeSpent += getOccurrenceTimeSpent(occ)
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
      occurrences: segmentOccurrences as TimelineOccurrence[],
      events: segmentEvents as TimelineEvent[],
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
        filteredCount={sortedFilteredTasks.length}
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
            ) : sortedFilteredTasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                {activeTasks.length === 0 
                  ? "No hay tareas con actividad en este rango de fechas"
                  : "No hay tareas que coincidan con los filtros aplicados"}
              </div>
            ) : (
              sortedFilteredTasks.map((task) => {
                // Build cell data for this task
                const cellDataBySegment = buildCellDataForTask(
                  task,
                  currentData.occurrences as TimelineOccurrence[],
                  currentData.events as TimelineEvent[],
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
