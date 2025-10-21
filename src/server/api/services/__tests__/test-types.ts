/**
 * Type definitions for tests
 */

export interface MockTask {
  id: number;
  name?: string;
  taskType?: string;
  isActive?: boolean;
  recurrence: MockRecurrence;
}

export interface MockRecurrence {
  id: number;
  interval: number | null;
  maxOccurrences: number | null;
  completedOccurrences: number;
  lastPeriodStart: Date | null;
  daysOfWeek: string[] | null;
  daysOfMonth: number[] | null;
  endDate: Date | null;
}

export interface MockOccurrence {
  id: number;
  associatedTaskId: number;
  startDate: Date;
  targetDate: Date;
  limitDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
  completedAt?: Date;
  task?: MockTask;
}

export interface CreateOccurrenceDTO {
  associatedTaskId: number;
  startDate: Date;
  targetDate: Date;
  limitDate: Date;
  targetTimeConsumption?: number;
}
