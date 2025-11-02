export function getWeekDays(date: Date): Date[] {
  const days: Date[] = []
  const current = new Date(date)
  current.setDate(current.getDate() - current.getDay()) // Start from Sunday

  for (let i = 0; i < 7; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

export function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: Date[] = []

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(firstDay)
    day.setDate(day.getDate() - (i + 1))
    days.push(day)
  }

  // Add all days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add days from next month to fill the last week
  const remainingDays = 42 - days.length // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const day = new Date(lastDay)
    day.setDate(day.getDate() + i)
    days.push(day)
  }

  return days
}

export function getHoursArray(): number[] {
  return Array.from({ length: 24 }, (_, i) => i)
}

export function formatTime(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:00 ${period}`
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getCurrentTimePosition(): number {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  return hours + minutes / 60
}

/**
 * Ensures a date value is converted to a proper Date object in local timezone
 * Handles Date objects, timestamp strings, and ISO strings
 * 
 * IMPORTANT: When dates come from the database as ISO strings (e.g., "2024-11-02T14:00:00.000Z"),
 * JavaScript's Date constructor automatically converts them to the local timezone.
 * This function ensures consistent handling across the application.
 */
export function ensureLocalDate(dateValue: Date | string | number): Date {
  if (dateValue instanceof Date) {
    return dateValue
  }
  
  // Create a Date object from the value
  // If it's an ISO string from the backend (UTC), this will automatically
  // convert it to the local timezone
  const date = new Date(dateValue)
  
  // Validate that the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date value:', dateValue)
    return new Date() // Return current date as fallback
  }
  
  return date
}

/**
 * Groups events that start within the same hour range (overlapping start times)
 * Returns an array of groups where each group contains events with overlapping start times
 */
export function groupOverlappingEvents<T extends { start: Date | string | number; finish: Date | string | number }>(
  events: T[]
): Array<{ events: T[]; startHour: number; duration: number }> {
  if (events.length === 0) return []

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = ensureLocalDate(a.start)
    const bStart = ensureLocalDate(b.start)
    return aStart.getTime() - bStart.getTime()
  })

  const groups: Array<{ events: T[]; startHour: number; duration: number }> = []
  
  for (const event of sortedEvents) {
    const eventStart = ensureLocalDate(event.start)
    const eventStartHour = eventStart.getHours() + eventStart.getMinutes() / 60
    
    // Find if there's a group within 1 hour of this event's start time
    const existingGroup = groups.find(group => {
      const timeDiff = Math.abs(group.startHour - eventStartHour)
      return timeDiff < 1 // Within 1 hour
    })
    
    if (existingGroup) {
      existingGroup.events.push(event)
      
      // Recalculate range: from earliest start to latest finish
      let earliestStart = Infinity
      let latestFinish = -Infinity
      
      for (const e of existingGroup.events) {
        const start = ensureLocalDate(e.start)
        const finish = ensureLocalDate(e.finish)
        const startHour = start.getHours() + start.getMinutes() / 60
        const finishHour = finish.getHours() + finish.getMinutes() / 60
        
        earliestStart = Math.min(earliestStart, startHour)
        latestFinish = Math.max(latestFinish, finishHour)
      }
      
      existingGroup.startHour = earliestStart
      existingGroup.duration = latestFinish - earliestStart
    } else {
      const eventFinish = ensureLocalDate(event.finish)
      const eventFinishHour = eventFinish.getHours() + eventFinish.getMinutes() / 60
      const eventDuration = eventFinishHour - eventStartHour
      
      groups.push({
        events: [event],
        startHour: eventStartHour,
        duration: eventDuration
      })
    }
  }
  
  // Only return groups that have more than 1 event
  return groups.filter(group => group.events.length > 1)
}
