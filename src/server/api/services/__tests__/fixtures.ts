import type { TaskWithRecurrence, TaskOccurrence, CalendarEvent, EventWithDetails, CreateTaskDTO } from '~/types';

export function makeTaskWithRecurrence(overrides?: Partial<TaskWithRecurrence>): TaskWithRecurrence {
  const now = new Date();
  return {
    id: overrides?.id ?? 1,
    ownerId: overrides?.ownerId ?? 'user-1',
    name: overrides?.name ?? 'Task',
    description: overrides?.description ?? null,
    recurrenceId: overrides?.recurrenceId ?? null,
    importance: overrides?.importance ?? 0,
    isActive: overrides?.isActive ?? true,
    isFixed: overrides?.isFixed ?? false,
    fixedStartTime: overrides?.fixedStartTime ?? null,
    fixedEndTime: overrides?.fixedEndTime ?? null,
    completedAt: overrides?.completedAt ?? null,
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    recurrence: overrides?.recurrence ?? undefined,
    taskType: overrides?.taskType ?? (overrides?.recurrence ? 'Recurrente Finita' : 'Única'),
  } as TaskWithRecurrence;
}

export function makeTaskOccurrence(overrides?: Partial<TaskOccurrence>): TaskOccurrence {
  const now = new Date();
  return {
    id: overrides?.id ?? 1,
    associatedTaskId: overrides?.associatedTaskId ?? 1,
    startDate: overrides?.startDate ?? now,
    limitDate: overrides?.limitDate ?? null,
    targetDate: overrides?.targetDate ?? null,
    targetTimeConsumption: overrides?.targetTimeConsumption ?? null,
    timeConsumed: overrides?.timeConsumed ?? null,
    status: overrides?.status ?? 'Pending',
    urgency: overrides?.urgency ?? null,
    completedAt: overrides?.completedAt ?? null,
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
  } as TaskOccurrence;
}

export function makeEventWithDetails(overrides?: Partial<EventWithDetails>): EventWithDetails {
  const now = new Date();
  return {
    id: overrides?.id ?? 1,
    context: overrides?.context ?? null,
    ownerId: overrides?.ownerId ?? 'user-1',
    associatedOccurrenceId: overrides?.associatedOccurrenceId ?? null,
    isFixed: overrides?.isFixed ?? false,
    start: overrides?.start ?? now,
    finish: overrides?.finish ?? new Date(now.getTime() + 3600 * 1000),
    isCompleted: overrides?.isCompleted ?? false,
    dedicatedTime: overrides?.dedicatedTime ?? 0,
    completedAt: overrides?.completedAt ?? null,
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    occurrence: overrides?.occurrence,
  } as EventWithDetails;
}

export function makeCreateTaskDTO(overrides?: Partial<CreateTaskDTO>): CreateTaskDTO {
  return {
    name: overrides?.name ?? 'New Task',
    description: overrides?.description ?? undefined,
    importance: overrides?.importance ?? undefined,
    targetDate: overrides?.targetDate ?? undefined,
    limitDate: overrides?.limitDate ?? undefined,
    targetTimeConsumption: overrides?.targetTimeConsumption ?? undefined,
    recurrence: overrides?.recurrence ?? undefined,
    isFixed: overrides?.isFixed ?? undefined,
    fixedStartTime: overrides?.fixedStartTime ?? undefined,
    fixedEndTime: overrides?.fixedEndTime ?? undefined,
  } as CreateTaskDTO;
}
