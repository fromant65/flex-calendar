export type TaskOccurrenceStatus = "Pending" | "In Progress" | "Completed" | "Skipped"

export interface Task {
  id: number
  ownerId: string
  name: string
  description: string | null
  recurrenceId: number | null
  importance: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

export interface TaskRecurrence {
  id: number
  creationDate: Date
  interval: number | null
  daysOfWeek: string[] | null
  daysOfMonth: number[] | null
  maxOccurrences: number | null
  completedOccurrences: number | null
  lastPeriodStart: Date | null
  endDate: Date | null
}

export interface TaskOccurrence {
  id: number
  associatedTaskId: number
  startDate: Date
  limitDate: Date | null
  targetDate: Date | null
  targetTimeConsumption: number | null
  timeConsumed: number | null
  status: TaskOccurrenceStatus
  urgency: number | null
  createdAt: Date
  updatedAt: Date | null
}

export interface CalendarEvent {
  id: number
  context: string | null
  ownerId: string
  associatedOccurrenceId: number | null
  isFixed: boolean
  start: Date
  finish: Date
  isCompleted: boolean
  dedicatedTime: number
  createdAt: Date
  updatedAt: Date | null
}

export interface TaskWithDetails extends Task {
  recurrence?: TaskRecurrence
  nextOccurrence?: TaskOccurrence
}

export interface OccurrenceWithTask extends TaskOccurrence {
  task: Task
}

export interface EventWithDetails extends CalendarEvent {
  occurrence?: OccurrenceWithTask
}

export type CalendarView = "day" | "week" | "month"

export interface QuadrantPosition {
  quadrant: "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
  importance: number
  urgency: number
}
