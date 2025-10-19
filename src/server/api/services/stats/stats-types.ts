/**
 * Stats Types - Type definitions for statistics calculations
 */

/**
 * Task entity for statistics
 */
export interface StatsTask {
  id: number;
  name: string;
  ownerId: string;
  importance: number | null;
  isFixed: boolean;
  recurrenceId: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Task Occurrence entity for statistics
 */
export interface StatsOccurrence {
  id: number;
  associatedTaskId: number;
  status: string; // Accept any status string from DB
  startDate: Date;
  limitDate: Date | null;
  targetDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  timeConsumed: number | null; // in minutes
  targetTimeConsumption: number | null; // in minutes
}

/**
 * Calendar Event entity for statistics
 */
export interface StatsEvent {
  id: number;
  ownerId: string;
  start: Date;
  finish: Date;
  isCompleted: boolean;
  associatedOccurrenceId: number | null;
  dedicatedTime: number | null; // in hours
}

/**
 * Recurrence entity for statistics
 */
export interface StatsRecurrence {
  id: number;
  maxOccurrences: number | null;
}

/**
 * Dataset passed to statistics calculators
 */
export interface StatsDataset {
  tasks: StatsTask[];
  occurrences: StatsOccurrence[];
  events: StatsEvent[];
  recurrenceMap: Map<number, StatsRecurrence>;
}
