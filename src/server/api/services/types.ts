/**
 * Common types and DTOs used across services
 */

// Task Occurrence Status
export type TaskOccurrenceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Skipped';

// Task Type (based on recurrence pattern)
export enum TaskType {
  SINGLE = 'Única',
  FINITE_RECURRING = 'Recurrente Finita',
  HABIT = 'Hábito',
  HABIT_PLUS = 'Hábito +',
  FIXED_SINGLE = 'Fija Única',
  FIXED_REPETITIVE = 'Fija Repetitiva',
}

// Legacy type alias for backwards compatibility
export type TaskTypeString = 'Única' | 'Recurrente Finita' | 'Hábito' | 'Hábito +' | 'Fija Única' | 'Fija Repetitiva';

// Day of Week
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

// Entity Types (as returned from DB)
export interface Task {
  id: number;
  ownerId: string;
  name: string;
  description: string | null;
  recurrenceId: number | null;
  importance: number;
  isActive: boolean;
  isFixed: boolean;
  fixedStartTime: string | null;
  fixedEndTime: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TaskRecurrence {
  id: number;
  creationDate: Date;
  interval: number | null;
  daysOfWeek: string[] | null;
  daysOfMonth: number[] | null;
  maxOccurrences: number | null;
  completedOccurrences: number | null;
  lastPeriodStart: Date | null;
  endDate: Date | null;
}

export interface TaskOccurrence {
  id: number;
  associatedTaskId: number;
  startDate: Date;
  limitDate: Date | null;
  targetDate: Date | null;
  targetTimeConsumption: number | null;
  timeConsumed: number | null;
  status: TaskOccurrenceStatus;
  urgency: number | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CalendarEvent {
  id: number;
  context: string | null;
  ownerId: string;
  associatedOccurrenceId: number | null;
  isFixed: boolean;
  start: Date;
  finish: Date;
  isCompleted: boolean;
  dedicatedTime: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

// DTOs for Task Service

export interface CreateTaskDTO {
  name: string;
  description?: string;
  importance?: number; // 1-10
  targetDate?: Date; // For fixed tasks: start datetime. For others: target date
  limitDate?: Date; // For fixed tasks: end datetime. For others: limit date
  targetTimeConsumption?: number;
  recurrence?: CreateRecurrenceDTO;
  isFixed?: boolean;
}

export interface CreateRecurrenceDTO {
  interval?: number;
  daysOfWeek?: DayOfWeek[];
  daysOfMonth?: number[];
  maxOccurrences?: number;
  lastPeriodStart?: Date;
  endDate?: Date; // REQUIRED for fixed repetitive tasks (isFixed=true with daysOfWeek/daysOfMonth)
}

export interface UpdateTaskDTO {
  name?: string;
  description?: string;
  importance?: number;
  isActive?: boolean;
}

export interface CreateOccurrenceDTO {
  associatedTaskId: number;
  startDate: Date;
  limitDate?: Date;
  targetDate?: Date;
  targetTimeConsumption?: number;
}

export interface UpdateOccurrenceDTO {
  startDate?: Date;
  limitDate?: Date;
  targetDate?: Date;
  targetTimeConsumption?: number;
  timeConsumed?: number;
  status?: TaskOccurrenceStatus;
}

export interface CreateCalendarEventDTO {
  context?: string;
  associatedOccurrenceId?: number;
  isFixed: boolean;
  start: Date;
  finish: Date;
}

export interface UpdateCalendarEventDTO {
  context?: string;
  isFixed?: boolean;
  start?: Date;
  finish?: Date;
  isCompleted?: boolean;
  dedicatedTime?: number;
  completedAt?: Date;
}

// Output DTOs with calculated fields

export interface TaskWithDetails extends Task {
  recurrence?: TaskRecurrence | null;
  nextOccurrence?: TaskOccurrence;
  taskType: TaskType;
}

export interface OccurrenceWithTask extends TaskOccurrence {
  task: Task;
}

export interface EventWithDetails extends CalendarEvent {
  occurrence?: TaskOccurrence;
  task?: Task;
}

// Analytics DTOs

export interface TaskStatistics {
  totalTasks: number;
  activeTasks: number;
  completedOccurrences: number;
  pendingOccurrences: number;
  totalTimeSpent: number;
  averageCompletionRate: number;
}

export interface UrgencyCalculationInput {
  currentDate: Date;
  creationDate: Date;
  targetDate?: Date;
  limitDate?: Date;
}

export interface UrgencyCalculationResult {
  urgency: number;
  isOverdue: boolean;
  daysUntilTarget?: number;
  daysUntilLimit?: number;
}
