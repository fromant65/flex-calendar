// Auto-derived endpoint types from tRPC AppRouter
// This uses tRPC's inference helpers so types stay in sync with routers.

import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

// Auth
export type AuthRegisterInput = inferProcedureInput<AppRouter["auth"]["register"]>;
export type AuthRegisterOutput = inferProcedureOutput<AppRouter["auth"]["register"]>;

export type AuthChangePasswordInput = inferProcedureInput<AppRouter["auth"]["changePassword"]>;
export type AuthChangePasswordOutput = inferProcedureOutput<AppRouter["auth"]["changePassword"]>;

// Task
export type TaskCreateInput = inferProcedureInput<AppRouter["task"]["create"]>;
export type TaskCreateOutput = inferProcedureOutput<AppRouter["task"]["create"]>;

export type TaskGetByIdInput = inferProcedureInput<AppRouter["task"]["getById"]>;
export type TaskGetByIdOutput = inferProcedureOutput<AppRouter["task"]["getById"]>;

export type TaskGetWithDetailsInput = inferProcedureInput<AppRouter["task"]["getWithDetails"]>;
export type TaskGetWithDetailsOutput = inferProcedureOutput<AppRouter["task"]["getWithDetails"]>;

export type TaskGetMyTasksOutput = inferProcedureOutput<AppRouter["task"]["getMyTasks"]>;
export type TaskGetMyActiveTasksOutput = inferProcedureOutput<AppRouter["task"]["getMyActiveTasks"]>;
export type TaskUpdateInput = inferProcedureInput<AppRouter["task"]["update"]>;
export type TaskUpdateOutput = inferProcedureOutput<AppRouter["task"]["update"]>;
export type TaskDeleteInput = inferProcedureInput<AppRouter["task"]["delete"]>;
export type TaskDeleteOutput = inferProcedureOutput<AppRouter["task"]["delete"]>;
export type TaskGetMyStatisticsOutput = inferProcedureOutput<AppRouter["task"]["getMyStatistics"]>;
export type TaskGetByUrgencyOutput = inferProcedureOutput<AppRouter["task"]["getByUrgency"]>;
export type TaskGetByImportanceOutput = inferProcedureOutput<AppRouter["task"]["getByImportance"]>;

// Occurrence
export type OccurrenceCreateInput = inferProcedureInput<AppRouter["occurrence"]["create"]>;
export type OccurrenceCreateOutput = inferProcedureOutput<AppRouter["occurrence"]["create"]>;

export type OccurrenceGetByIdInput = inferProcedureInput<AppRouter["occurrence"]["getById"]>;
export type OccurrenceGetByIdOutput = inferProcedureOutput<AppRouter["occurrence"]["getById"]>;

export type OccurrenceGetWithTaskOutput = inferProcedureOutput<AppRouter["occurrence"]["getWithTask"]>;
export type OccurrenceGetByTaskIdOutput = inferProcedureOutput<AppRouter["occurrence"]["getByTaskId"]>;
export type OccurrenceGetMyOccurrencesWithTaskOutput = inferProcedureOutput<AppRouter["occurrence"]["getMyOccurrencesWithTask"]>;
export type OccurrenceGetByDateRangeInput = inferProcedureInput<AppRouter["occurrence"]["getByDateRange"]>;
export type OccurrenceGetByDateRangeOutput = inferProcedureOutput<AppRouter["occurrence"]["getByDateRange"]>;
export type OccurrenceUpdateInput = inferProcedureInput<AppRouter["occurrence"]["update"]>;
export type OccurrenceUpdateOutput = inferProcedureOutput<AppRouter["occurrence"]["update"]>;
export type OccurrenceCompleteInput = inferProcedureInput<AppRouter["occurrence"]["complete"]>;
export type OccurrenceSkipInput = inferProcedureInput<AppRouter["occurrence"]["skip"]>;

// Calendar Event
export type EventCreateInput = inferProcedureInput<AppRouter["calendarEvent"]["create"]>;
export type EventCreateOutput = inferProcedureOutput<AppRouter["calendarEvent"]["create"]>;

export type EventGetByIdInput = inferProcedureInput<AppRouter["calendarEvent"]["getById"]>;
export type EventGetByIdOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getById"]>;

export type EventGetWithDetailsOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getWithDetails"]>;
export type EventGetMyEventsOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getMyEvents"]>;
export type EventGetMyEventsWithDetailsOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getMyEventsWithDetails"]>;
export type EventGetTodayEventsOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getTodayEvents"]>;
export type EventGetWeekEventsOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getWeekEvents"]>;
export type EventGetByDateRangeInput = inferProcedureInput<AppRouter["calendarEvent"]["getByDateRange"]>;
export type EventGetByDateRangeOutput = inferProcedureOutput<AppRouter["calendarEvent"]["getByDateRange"]>;
export type EventUpdateInput = inferProcedureInput<AppRouter["calendarEvent"]["update"]>;
export type EventUpdateOutput = inferProcedureOutput<AppRouter["calendarEvent"]["update"]>;
export type EventCompleteInput = inferProcedureInput<AppRouter["calendarEvent"]["complete"]>;
export type EventDeleteInput = inferProcedureInput<AppRouter["calendarEvent"]["delete"]>;

// Timeline
export type TimelineGetTimelineDataInput = inferProcedureInput<AppRouter["timeline"]["getTimelineData"]>;
export type TimelineGetTimelineDataOutput = inferProcedureOutput<AppRouter["timeline"]["getTimelineData"]>;

// Routine
export type RoutineCreateInput = inferProcedureInput<AppRouter["routine"]["create"]>;
export type RoutineCreateOutput = inferProcedureOutput<AppRouter["routine"]["create"]>;
export type RoutineGetMyRoutinesOutput = inferProcedureOutput<AppRouter["routine"]["getMyRoutines"]>;
export type RoutineGetByIdInput = inferProcedureInput<AppRouter["routine"]["getById"]>;
export type RoutineGetByIdOutput = inferProcedureOutput<AppRouter["routine"]["getById"]>;
export type RoutineUpdateInput = inferProcedureInput<AppRouter["routine"]["update"]>;
export type RoutineUpdateOutput = inferProcedureOutput<AppRouter["routine"]["update"]>;
export type RoutineDeleteInput = inferProcedureInput<AppRouter["routine"]["delete"]>;
export type RoutineDeleteOutput = inferProcedureOutput<AppRouter["routine"]["delete"]>;
export type RoutineAddTaskInput = inferProcedureInput<AppRouter["routine"]["addTask"]>;
export type RoutineRemoveTaskInput = inferProcedureInput<AppRouter["routine"]["removeTask"]>;
export type RoutineReorderInput = inferProcedureInput<AppRouter["routine"]["reorder"]>;
export type RoutineAddDependencyInput = inferProcedureInput<AppRouter["routine"]["addDependency"]>;
export type RoutineRemoveDependencyInput = inferProcedureInput<AppRouter["routine"]["removeDependency"]>;
export type RoutineValidateDagInput = inferProcedureInput<AppRouter["routine"]["validateDag"]>;
export type RoutineValidateDagOutput = inferProcedureOutput<AppRouter["routine"]["validateDag"]>;

// Convenience item-level aliases for UI components
export type TaskGetByUrgencyItem = TaskGetByUrgencyOutput[number];
export type TaskGetByImportanceItem = TaskGetByImportanceOutput[number];
export type OccurrenceGetByDateRangeItem = OccurrenceGetByDateRangeOutput[number];
export type EventGetMyEventsWithDetailsItem = EventGetMyEventsWithDetailsOutput[number];
export type EventGetTodayEventsItem = EventGetTodayEventsOutput[number];
export type EventGetWeekEventsItem = EventGetWeekEventsOutput[number];

// Convenience: re-export AppRouter for consumers
export type { AppRouter };
