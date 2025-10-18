/**
 * Custom hooks for Timeline View
 */

import { useState, useEffect, useMemo } from "react"
import { generateTimeSegments, getTasksWithActivityInRange, buildCellDataForTask } from "./timeline-utils"
import type { TimeSegment } from "./timeline-utils"
import type { TaskWithRecurrence, OccurrenceWithTask, EventWithDetails } from "~/types"

/**
 * Hook to detect mobile screen size
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Hook to manage timeline segments and visibility
 */
export function useTimelineSegments(currentDate: Date, daysToShow: number, isMobile: boolean) {
  const timeSegments = useMemo(() => {
    return generateTimeSegments(currentDate, daysToShow)
  }, [currentDate, daysToShow])

  const isCompactView = timeSegments.length > 14
  
  const visibleSegments = useMemo(() => {
    // Mobile: limit to 5 segments
    if (isMobile && timeSegments.length > 5) {
      return timeSegments.slice(0, 5)
    }
    // Desktop with many segments (annual view): limit to 12 segments
    if (!isMobile && timeSegments.length > 12) {
      return timeSegments.slice(0, 12)
    }
    return timeSegments
  }, [isMobile, timeSegments])

  return {
    timeSegments,
    visibleSegments,
    isCompactView,
    startDate: timeSegments[0]?.start,
    endDate: timeSegments[timeSegments.length - 1]?.end,
  }
}

/**
 * Hook to build cell data for tasks
 */
export function useTaskCellData(
  tasks: TaskWithRecurrence[],
  occurrences: OccurrenceWithTask[],
  events: EventWithDetails[],
  timeSegments: TimeSegment[]
) {
  return useMemo(() => {
    const cellDataByTask = new Map()
    tasks.forEach((task) => {
      const cellData = buildCellDataForTask(task, occurrences, events, timeSegments)
      cellDataByTask.set(task.id, cellData)
    })
    return cellDataByTask
  }, [tasks, occurrences, events, timeSegments])
}

/**
 * Hook to filter active tasks
 */
export function useActiveTasks(
  tasks: TaskWithRecurrence[],
  occurrences: OccurrenceWithTask[],
  timeSegments: TimeSegment[]
) {
  return useMemo(() => {
    return getTasksWithActivityInRange(tasks, occurrences, timeSegments)
  }, [tasks, occurrences, timeSegments])
}
