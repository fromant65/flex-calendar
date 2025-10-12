// Auto-generated endpoint input/output types for tRPC routers
// - Uses Zod input shapes found in routers
// - Re-uses service-level entity types from ../services/types where available
// - Add/adjust as needed if service implementations change

import type {
  Task,
  TaskRecurrence,
  TaskOccurrence,
  CalendarEvent,
  CreateTaskDTO,
  CreateRecurrenceDTO,
  UpdateTaskDTO,
  CreateOccurrenceDTO,
  UpdateOccurrenceDTO,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
  TaskWithDetails,
  OccurrenceWithTask,
  EventWithDetails,
  TaskStatistics,
} from "~/server/api/services/types";

// ------------------------------
// Auth Router
// ------------------------------
export namespace AuthEndpoints {
  // register (public)
  export type RegisterInput = {
    name: string;
    email: string;
    password: string;
  };

  export type RegisterOutput = {
    id: string;
    name: string | null;
    email: string;
  };

  // changePassword (protected)
  export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
  };

  export type ChangePasswordOutput = { success: true };
}

// ------------------------------
// Task Router
// ------------------------------
export namespace TaskEndpoints {
  export type CreateRecurrence = CreateRecurrenceDTO;
  export type CreateTaskInput = CreateTaskDTO;
  export type CreateTaskOutput = TaskWithDetails; // service returns created task with details

  export type GetByIdInput = { id: number };
  export type GetByIdOutput = TaskWithDetails | null;

  export type GetWithDetailsInput = { id: number };
  export type GetWithDetailsOutput = TaskWithDetails | null;

  export type GetMyTasksInput = undefined;
  export type GetMyTasksOutput = TaskWithDetails[];

  export type GetMyActiveTasksInput = undefined;
  export type GetMyActiveTasksOutput = TaskWithDetails[];

  export type UpdateTaskInput = { id: number; data: UpdateTaskDTO };
  export type UpdateTaskOutput = TaskWithDetails;

  export type DeleteTaskInput = { id: number };
  export type DeleteTaskOutput = { success: true };

  export type GetMyStatisticsInput = undefined;
  export type GetMyStatisticsOutput = TaskStatistics;

  export type GetByUrgencyInput = undefined;
  export type GetByUrgencyOutput = OccurrenceWithTask[]; // occurrences sorted by urgency
}

// ------------------------------
// Occurrence Router
// ------------------------------
export namespace OccurrenceEndpoints {
  export type CreateInput = CreateOccurrenceDTO;
  export type CreateOutput = TaskOccurrence;

  export type GetByIdInput = { id: number };
  export type GetByIdOutput = TaskOccurrence | null;

  export type GetWithTaskInput = { id: number };
  export type GetWithTaskOutput = OccurrenceWithTask | null;

  export type GetByTaskIdInput = { taskId: number };
  export type GetByTaskIdOutput = TaskOccurrence[];

  export type GetByDateRangeInput = { startDate: Date; endDate: Date };
  export type GetByDateRangeOutput = TaskOccurrence[];

  export type UpdateInput = { id: number; data: UpdateOccurrenceDTO };
  export type UpdateOutput = TaskOccurrence;

  export type CompleteInput = { id: number };
  export type CompleteOutput = { success: true } | TaskOccurrence;

  export type SkipInput = { id: number };
  export type SkipOutput = { success: true } | TaskOccurrence;
}

// ------------------------------
// Calendar Event Router
// ------------------------------
export namespace CalendarEventEndpoints {
  export type CreateInput = CreateCalendarEventDTO;
  export type CreateOutput = CalendarEvent;

  export type GetByIdInput = { id: number };
  export type GetByIdOutput = CalendarEvent | null;

  export type GetWithDetailsInput = { id: number };
  export type GetWithDetailsOutput = EventWithDetails | null;

  export type GetMyEventsInput = undefined;
  export type GetMyEventsOutput = CalendarEvent[];

  export type GetMyEventsWithDetailsInput = undefined;
  export type GetMyEventsWithDetailsOutput = EventWithDetails[];

  export type GetByDateRangeInput = { startDate: Date; endDate: Date };
  export type GetByDateRangeOutput = CalendarEvent[];

  export type UpdateInput = { id: number; data: UpdateCalendarEventDTO };
  export type UpdateOutput = CalendarEvent;

  export type CompleteInput = { id: number };
  export type CompleteOutput = { success: true } | CalendarEvent;

  export type DeleteInput = { id: number };
  export type DeleteOutput = { success: true };
}

// Re-export common entities for convenience
export type { Task, TaskRecurrence, TaskOccurrence, CalendarEvent, TaskWithDetails, OccurrenceWithTask, EventWithDetails };
