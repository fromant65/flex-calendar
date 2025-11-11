/**
 * Timeline utility functions
 */

import type { TaskWithRecurrence, OccurrenceWithTask, EventWithDetails } from "~/types"
import type { TimelineCellData } from "./timeline-cell"

export interface TimeRange {
  start: Date
  end: Date
}

export type SegmentType = "hours" | "days" | "weeks" | "months"

export interface TimeSegment {
  start: Date
  end: Date
  type: SegmentType
  label: string
}

/**
 * Determine segment type based on days to show
 */
export const getSegmentType = (daysToShow: number): SegmentType => {
  if (daysToShow <= 3) return "hours"
  if (daysToShow >= 150) return "months" // 6 months and 1 year use monthly segments
  if (daysToShow >= 30) return "weeks"
  return "days"
}

/**
 * Get segment duration in hours
 */
export const getSegmentDuration = (type: SegmentType): number => {
  switch (type) {
    case "hours":
      return 3 // 3 hours
    case "days":
      return 24 // 1 day
    case "weeks":
      return 24 * 7 // 7 days
    case "months":
      return 24 * 30 // ~30 days
  }
}

/**
 * Generate time segments for the timeline based on current date and days to show
 */
export const generateTimeSegments = (
  currentDate: Date,
  daysToShow: number
): TimeSegment[] => {
  const segments: TimeSegment[] = []
  const segmentType = getSegmentType(daysToShow)

  if (segmentType === "hours") {
    // For 1-3 days view: 3-hour segments
    // Start from the current hour (rounded down to nearest 3-hour block)
    const startHour = Math.floor(currentDate.getHours() / 3) * 3
    const segmentStart = new Date(currentDate)
    segmentStart.setHours(startHour, 0, 0, 0)
    
    const totalSegments = Math.ceil((daysToShow * 24) / 3)
    
    for (let i = 0; i < totalSegments; i++) {
      const start = new Date(segmentStart)
      start.setHours(start.getHours() + i * 3)
      
      const end = new Date(start)
      end.setHours(end.getHours() + 3)
      end.setMilliseconds(-1)
      
      const hour = start.getHours()
      const dateLabel = `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}`
      
      segments.push({
        start: start,
        end: end,
        type: "hours",
        label: `${hour}:00 ${dateLabel}`,
      })
    }
  } else if (segmentType === "months") {
    // For 6 months and 1 year view: 1-month segments
    const startOfMonth = new Date(currentDate)
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    // Calculate number of months based on daysToShow
    const totalMonths = Math.ceil(daysToShow / 30)
    
    for (let i = 0; i < totalMonths; i++) {
      const segmentStart = new Date(startOfMonth)
      segmentStart.setMonth(segmentStart.getMonth() + i)
      
      const segmentEnd = new Date(segmentStart)
      segmentEnd.setMonth(segmentEnd.getMonth() + 1)
      segmentEnd.setMilliseconds(-1)
      
      const startDay = segmentStart.getDate().toString().padStart(2, '0')
      const startMonth = (segmentStart.getMonth() + 1).toString().padStart(2, '0')
      const endDate = new Date(segmentEnd)
      const endDay = endDate.getDate().toString().padStart(2, '0')
      const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0')
      
      segments.push({
        start: segmentStart,
        end: segmentEnd,
        type: "months",
        label: `${startDay}/${startMonth} - ${endDay}/${endMonth}`,
      })
    }
  } else if (segmentType === "weeks") {
    // For 30-364 days view: 1-week segments
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const totalWeeks = Math.ceil(daysToShow / 7)
    
    for (let i = 0; i < totalWeeks; i++) {
      const segmentStart = new Date(startOfWeek)
      segmentStart.setDate(segmentStart.getDate() + i * 7)
      
      const segmentEnd = new Date(segmentStart)
      segmentEnd.setDate(segmentEnd.getDate() + 6)
      segmentEnd.setHours(23, 59, 59, 999)
      
      const startDay = segmentStart.getDate().toString().padStart(2, '0')
      const startMonth = (segmentStart.getMonth() + 1).toString().padStart(2, '0')
      const endDay = segmentEnd.getDate().toString().padStart(2, '0')
      const endMonth = (segmentEnd.getMonth() + 1).toString().padStart(2, '0')
      
      segments.push({
        start: segmentStart,
        end: segmentEnd,
        type: "weeks",
        label: `${startDay}/${startMonth} - ${endDay}/${endMonth}`,
      })
    }
  } else {
    // For 7-14 days view: daily segments
    for (let i = 0; i < daysToShow; i++) {
      const segmentStart = new Date(currentDate)
      segmentStart.setDate(segmentStart.getDate() + i)
      segmentStart.setHours(0, 0, 0, 0)
      
      const segmentEnd = new Date(segmentStart)
      segmentEnd.setHours(23, 59, 59, 999)
      
      segments.push({
        start: segmentStart,
        end: segmentEnd,
        type: "days",
        label: formatDate(segmentStart),
      })
    }
  }

  return segments
}

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
}

/**
 * Format day of week
 */
export const formatDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase()
}

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Check if a date/time falls within a time segment
 */
export const isInSegment = (date: Date, segment: TimeSegment): boolean => {
  const dateTime = date.getTime()
  return dateTime >= segment.start.getTime() && dateTime <= segment.end.getTime()
}

/**
 * Get segment key for mapping
 */
export const getSegmentKey = (segment: TimeSegment): string => {
  return `${segment.start.getTime()}-${segment.end.getTime()}`
}

/**
 * Build cell data map for a task across the time segments
 * Returns a map of segment keys to cell data
 */
export const buildCellDataForTask = (
  task: TaskWithRecurrence,
  occurrences: OccurrenceWithTask[],
  events: EventWithDetails[],
  segments: TimeSegment[]
): Map<string, TimelineCellData> => {
  const cellDataMap = new Map<string, TimelineCellData>()

  // Filter occurrences for this task - Include all statuses
  const taskOccurrences = occurrences.filter(
    (occ) => occ.associatedTaskId === task.id
  )

  // For each segment
  segments.forEach((segment, segmentIndex) => {
    const segmentKey = getSegmentKey(segment)

    // Find occurrences that fall within this segment
    const segmentOccurrences = taskOccurrences.filter((occ) => {
      const occDate = new Date(occ.startDate)
      return isInSegment(occDate, segment)
    })

    if (segmentOccurrences.length === 0) {
      return // No data for this segment
    }

    // Find events for these occurrences that fall within this segment
    const segmentEvents = events.filter((event) => {
      if (!segmentOccurrences.some((occ) => occ.id === event.associatedOccurrenceId)) {
        return false
      }
      const eventStart = new Date(event.start)
      return isInSegment(eventStart, segment)
    })

    // Calculate total time spent across all occurrences/events in segment
    let totalTimeSpent = 0
    segmentEvents.forEach((event) => {
      if (event.dedicatedTime) {
        totalTimeSpent += event.dedicatedTime
      }
    })

    // If no events but occurrences have time consumed, sum them
    if (segmentEvents.length === 0) {
      segmentOccurrences.forEach((occ) => {
        if (occ.timeConsumed) {
          totalTimeSpent += occ.timeConsumed
        }
      })
    }

    // Determine status based on priority: completed > in-progress > pending > skipped > not-completed
    let status: TimelineCellData["status"] = "empty"
    const hasCompleted = segmentOccurrences.some((occ) => occ.status === "Completed")
    const hasInProgress = segmentOccurrences.some((occ) => occ.status === "In Progress")
    const hasPending = segmentOccurrences.some((occ) => occ.status === "Pending")
    const hasSkipped = segmentOccurrences.some((occ) => occ.status === "Skipped")

    // Priority: show most significant status
    if (hasCompleted) {
      status = "completed"
    } else if (hasInProgress) {
      status = "in-progress"
    } else if (hasPending) {
      status = "pending"
    } else if (hasSkipped) {
      status = "skipped"
    } else {
      // Any other status is considered not-completed
      status = "not-completed"
    }

    // Get the latest completion date in the segment
    const completedOccurrences = segmentOccurrences.filter((occ) => occ.status === "Completed")
    const completedAt = completedOccurrences.length > 0
      ? completedOccurrences.reduce((latest, occ) => {
          if (!occ.completedAt) return latest
          if (!latest) return occ.completedAt
          return new Date(occ.completedAt) > new Date(latest) ? occ.completedAt : latest
        }, null as Date | null)
      : undefined

    cellDataMap.set(segmentKey, {
      status,
      timeSpent: totalTimeSpent > 0 ? totalTimeSpent : undefined,
      occurrenceIds: segmentOccurrences.map(occ => occ.id), // Store all occurrence IDs
      eventIds: segmentEvents.map((e) => e.id),
      completedAt: completedAt || undefined,
      isMultipleEvents: segmentEvents.length > 1,
      occurrenceCount: segmentOccurrences.length, // Track count for badge
    })
  })

  return cellDataMap
}

/**
 * Get tasks that have activity in the segment range
 */
export const getTasksWithActivityInRange = (
  allTasks: TaskWithRecurrence[],
  allOccurrences: OccurrenceWithTask[],
  segments: TimeSegment[]
): TaskWithRecurrence[] => {
  if (segments.length === 0) return []

  const firstSegment = segments[0]!
  const lastSegment = segments[segments.length - 1]!

  // Get occurrence IDs that fall in the segment range - Include all statuses
  const activeOccurrenceTaskIds = new Set<number>()

  allOccurrences.forEach((occ) => {
    const occDate = new Date(occ.startDate)
    // Check if occurrence falls within any segment
    const inRange = segments.some((segment) => isInSegment(occDate, segment))
    if (inRange) {
      activeOccurrenceTaskIds.add(occ.associatedTaskId)
    }
  })

  // Filter tasks that have activity
  return allTasks.filter((task) => activeOccurrenceTaskIds.has(task.id))
}
