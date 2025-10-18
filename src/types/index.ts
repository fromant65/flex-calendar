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

// ============================================================================
// STATISTICS PAGE TYPES
// ============================================================================

// Task Statistics
export interface TaskStatsData {
  averageCompletionTime: number | null // Average time from creation to completion in hours
  importanceDistribution: ImportanceDistribution[]
  fixedVsFlexible: {
    fixed: number
    flexible: number
  }
  recurringVsUnique: {
    recurring: number
    unique: number
  }
}

export interface ImportanceDistribution {
  importance: number
  completionRate: number // Percentage (0-100)
  totalOccurrences: number
  completedOccurrences: number
}

// Recurrence Statistics
export interface RecurrenceStatsData {
  habitCompliance: HabitCompliancePoint[]
  maxStreak: number
  currentStreak: number
  frequentDays: DayFrequency[]
}

export interface HabitCompliancePoint {
  date: Date
  completionRate: number // Percentage (0-100)
  completedOccurrences: number
  totalOccurrences: number
}

export interface DayFrequency {
  day: DayOfWeek
  completionCount: number
  completionRate: number
}

// Occurrence Statistics
export interface OccurrenceStatsData {
  occurrencesByPeriod: OccurrencesPeriod[]
  statusDistribution: {
    pending: number
    inProgress: number
    completed: number
    skipped: number
  }
  averageTimeDeviation: number | null // Average difference between planned and actual time in hours
  averageUrgency: number | null
  averageResolutionTime: number | null // Average time from startDate to completedAt in hours
}

export interface OccurrencesPeriod {
  period: string // Date string for grouping (e.g., "2024-W01", "2024-01", "2024")
  count: number
}

// Calendar Statistics
export interface CalendarStatsData {
  completedVsIncomplete: {
    completed: number
    incomplete: number
  }
  hourlyDistribution: HourlyDistribution[]
  complianceRate: number // Percentage (0-100)
}

export interface HourlyDistribution {
  hour: number // 0-23
  count: number
  completionRate: number
}

// Global KPIs
export interface GlobalKPIs {
  completionRate: number // Percentage (0-100)
  totalTimeInvested: number // Total hours
  planningEfficiency: number | null // Ratio of dedicated time to consumed time
  averageWorkload: WorkloadData
  importanceBalance: ImportanceBalance
  urgencyBalance: UrgencyBalance
}

export interface WorkloadData {
  hoursPerDay: number
  hoursPerWeek: number
}

export interface ImportanceBalance {
  lowImportanceCompletionRate: number // Importance 1-3
  mediumImportanceCompletionRate: number // Importance 4-7
  highImportanceCompletionRate: number // Importance 8-10
}

export interface UrgencyBalance {
  earlyCompletionRate: number // Completed with > 50% time remaining
  onTimeCompletionRate: number // Completed with 10-50% time remaining
  lateCompletionRate: number // Completed with < 10% time remaining
}

// Advanced Insights
export interface AdvancedInsights {
  lowComplianceHabits: LowComplianceHabit[]
  completionTrend: TrendPoint[]
  recurringVsUniqueComparison: {
    recurringCompletionRate: number
    uniqueCompletionRate: number
  }
  bottlenecks: Bottleneck[]
}

export interface LowComplianceHabit {
  taskId: number
  taskName: string
  completionRate: number
  totalOccurrences: number
  completedOccurrences: number
}

export interface TrendPoint {
  period: string
  completionRate: number
}

export interface Bottleneck {
  taskId: number
  taskName: string
  pendingCount: number
  skippedCount: number
  totalCount: number
}

// Combined Statistics Response
export interface AllStatistics {
  taskStats: TaskStatsData
  recurrenceStats: RecurrenceStatsData
  occurrenceStats: OccurrenceStatsData
  calendarStats: CalendarStatsData
  globalKPIs: GlobalKPIs
  insights: AdvancedInsights
}
