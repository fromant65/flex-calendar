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
  status: "active" | "paused" | "completed";
  createdAt: Date;
  completedAt: Date | null;
}

export type StatsOccurrenceStatus =
  | "unassigned"
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";

/**
 * Task Occurrence entity for statistics
 */
export interface StatsOccurrence {
  id: number;
  taskId: number;
  status: StatsOccurrenceStatus;
  slotStartAt: Date | null;
  slotEndAt: Date | null;
  dueAt: Date | null;
  tentativeAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  timeSpentMinutes: number;
  targetTimeMinutes: number | null;
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
 * Dataset passed to statistics calculators
 */
export interface StatsDataset {
  tasks: StatsTask[];
  occurrences: StatsOccurrence[];
  events: StatsEvent[];
}
