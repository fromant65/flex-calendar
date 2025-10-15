/**
 * Central Type Definitions
 * Single source of truth for all shared types across frontend and backend
 * These types are available at the router/API boundary and in the frontend
 */

// ============================================================================
// ENUMS & LITERAL TYPES
// ============================================================================

export type TaskOccurrenceStatus = "Pending" | "In Progress" | "Completed" | "Skipped"

export type TaskType = "Única" | "Recurrente Finita" | "Hábito" | "Hábito +" | "Fija Única" | "Fija Repetitiva"

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

export type CalendarView = "day" | "week" | "month"

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Task {
  id: number
  ownerId: string
  name: string
  description: string | null
  recurrenceId: number | null
  importance: number
  isActive: boolean
  isFixed: boolean
  fixedStartTime: string | null
  fixedEndTime: string | null
  completedAt: Date | null
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
  completedAt: Date | null
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
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

// ============================================================================
// EXTENDED ENTITIES (with calculated/joined fields)
// ============================================================================

export interface TaskWithRecurrence extends Task {
  recurrence?: TaskRecurrence | null
  taskType?: TaskType
}

export interface TaskWithDetails extends Task {
  recurrence?: TaskRecurrence | null
  nextOccurrence?: TaskOccurrence
  taskType: TaskType
}

export interface OccurrenceWithTask extends TaskOccurrence {
  task: TaskWithRecurrence
}

export interface EventWithDetails extends CalendarEvent {
  occurrence?: OccurrenceWithTask
}

// ============================================================================
// UI-SPECIFIC TYPES
// ============================================================================

export interface QuadrantPosition {
  quadrant: "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
  importance: number
  urgency: number
}

// ============================================================================
// DTO TYPES (for API inputs)
// ============================================================================

export interface CreateTaskDTO {
  name: string
  description?: string
  importance?: number
  targetDate?: Date
  limitDate?: Date
  targetTimeConsumption?: number
  recurrence?: CreateRecurrenceDTO
  isFixed?: boolean
  fixedStartTime?: string // Required if isFixed is true
  fixedEndTime?: string   // Required if isFixed is true
}

export interface CreateRecurrenceDTO {
  interval?: number
  daysOfWeek?: DayOfWeek[]
  daysOfMonth?: number[]
  maxOccurrences?: number
  lastPeriodStart?: Date
  endDate?: Date // REQUIRED for fixed repetitive tasks (isFixed=true with daysOfWeek/daysOfMonth)
}

export interface UpdateTaskDTO {
  name?: string
  description?: string
  importance?: number
  isActive?: boolean
  isFixed?: boolean
  fixedStartTime?: string
  fixedEndTime?: string
}

export interface CreateOccurrenceDTO {
  associatedTaskId: number
  startDate: Date
  limitDate?: Date
  targetDate?: Date
  targetTimeConsumption?: number
}

export interface UpdateOccurrenceDTO {
  startDate?: Date
  limitDate?: Date
  targetDate?: Date
  targetTimeConsumption?: number
  timeConsumed?: number
  status?: TaskOccurrenceStatus
}

export interface CreateCalendarEventDTO {
  context?: string
  associatedOccurrenceId?: number
  isFixed: boolean
  start: Date
  finish: Date
}

export interface UpdateCalendarEventDTO {
  context?: string
  isFixed?: boolean
  start?: Date
  finish?: Date
  isCompleted?: boolean
  dedicatedTime?: number
}

// ============================================================================
// ANALYTICS & STATISTICS
// ============================================================================

export interface TaskStatistics {
  totalTasks: number
  activeTasks: number
  completedOccurrences: number
  pendingOccurrences: number
  totalTimeSpent: number
  averageCompletionRate: number
}

export interface UrgencyCalculationInput {
  currentDate: Date
  creationDate: Date
  targetDate?: Date
  limitDate?: Date
}

export interface UrgencyCalculationResult {
  urgency: number
  isOverdue: boolean
  daysUntilTarget?: number
  daysUntilLimit?: number
}
