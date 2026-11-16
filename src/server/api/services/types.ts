/**
 * Common types and DTOs used across services
 */

// Task/Occurrence Status (V2)
export type TaskStatus = 'active' | 'paused' | 'completed';
export type TaskOccurrenceStatus =
  | 'unassigned'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped';

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
  importance: number;
  difficulty: number;
  isDivisible: boolean;
  urgencyThresholdAt: Date | null;
  durationMinutes: number | null;
  isFixed: boolean;
  fixedStartTime: string | null;
  fixedEndTime: string | null;
  status: TaskStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  // Legacy compatibility during V1->V2 migration
  recurrenceId?: number | null;
  isActive?: boolean;
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
  taskId: number;
  slotStartAt: Date | null;
  slotEndAt: Date | null;
  dueAt: Date | null;
  tentativeAt: Date | null;
  targetTimeMinutes: number | null;
  timeSpentMinutes: number;
  status: TaskOccurrenceStatus;
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
  importance?: number;
  difficulty?: number;
  isDivisible?: boolean;
  urgencyThresholdAt?: Date;
  durationMinutes?: number;
  isFixed?: boolean;
  fixedStartTime?: string;
  fixedEndTime?: string;
  // Legacy compatibility during V1->V2 migration
  targetDate?: Date;
  limitDate?: Date;
  targetTimeConsumption?: number;
  recurrence?: CreateRecurrenceDTO;
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
  difficulty?: number;
  isDivisible?: boolean;
  urgencyThresholdAt?: Date | null;
  durationMinutes?: number | null;
  isFixed?: boolean;
  fixedStartTime?: string | null;
  fixedEndTime?: string | null;
  status?: TaskStatus;
}

export interface CreateOccurrenceDTO {
  taskId: number;
  slotStartAt?: Date | null;
  slotEndAt?: Date | null;
  dueAt?: Date;
  tentativeAt?: Date;
  targetTimeMinutes?: number;
}

export interface UpdateOccurrenceDTO {
  slotStartAt?: Date | null;
  slotEndAt?: Date | null;
  dueAt?: Date | null;
  tentativeAt?: Date | null;
  targetTimeMinutes?: number | null;
  timeSpentMinutes?: number;
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

// Notification Types

export interface Notification {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface NotificationWithReadStatus {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface CreateNotificationDTO {
  title: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateNotificationDTO {
  title?: string;
  description?: string;
  isActive?: boolean;
}
