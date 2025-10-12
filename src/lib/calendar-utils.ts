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
