import type { OccurrenceWithTask } from "~/types";
import type { TaskManagerOccurrence } from "./task-manager-timeline";
import { useTaskManagerState } from "./hooks/use-task-manager-state";
import { useTaskManagerQueries } from "./hooks/use-task-manager-queries";
import { useTaskManagerMutations } from "./hooks/use-task-manager-mutations";
import { useTaskManagerComputed } from "./hooks/use-task-manager-computed";
import type { TaskManagerOccurrenceLike } from "./hooks/use-task-manager-computed";

export type { TaskWithOccurrences } from "./hooks/use-task-manager-computed";

export function useTaskManagerData() {
  // State management
  const {
    selectedTaskId,
    setSelectedTaskId,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    confirmAction,
    setConfirmAction,
    editingOccurrence,
    setEditingOccurrence,
  } = useTaskManagerState();

  // Data queries
  const {
    allOccurrences,
    occurrences,
    nextOccurrenceDate,
    isLoading,
  } = useTaskManagerQueries(selectedTaskId, filters);

  // Mutations and handlers
  const {
    completeOccurrence,
    skipOccurrence,
    updateOccurrence,
    skipBacklog,
    handleConfirmAction,
    handleSaveOccurrence,
  } = useTaskManagerMutations(setConfirmAction, setEditingOccurrence);

  // Computed values
  const {
    groupedOccurrences,
    sortedTasks,
    totalTasksCount,
  } = useTaskManagerComputed(allOccurrences as TaskManagerOccurrenceLike[] | undefined, occurrences as TaskManagerOccurrenceLike[], filters);

  // Timeline handlers
  const handleTimelineOccurrenceClick = (occurrence: TaskManagerOccurrence) => {
    setSelectedTaskId(occurrence.task.id);
  };

  const handleTimelineComplete = (occurrenceId: number) => {
    const occurrence = occurrences?.find(o => o.id === occurrenceId);
    if (occurrence) {
      setConfirmAction({
        type: "complete",
        occurrenceId,
        taskName: occurrence.task.name
      });
    }
  };

  const handleTimelineSkip = (occurrenceId: number) => {
    const occurrence = occurrences?.find(o => o.id === occurrenceId);
    if (occurrence) {
      setConfirmAction({
        type: "skip",
        occurrenceId,
        taskName: occurrence.task.name
      });
    }
  };

  const handleTimelineEdit = (occurrence: TaskManagerOccurrence) => {
    const occurrenceV2 = occurrence as TaskManagerOccurrence & {
      timeConsumed?: number | null
      timeSpentMinutes?: number | null
      targetTimeMinutes?: number | null
      tentativeAt?: Date | null
      dueAt?: Date | null
      targetDate?: Date | null
      limitDate?: Date | null
    }

    setEditingOccurrence({
      id: occurrence.id,
      timeConsumed: occurrenceV2.timeSpentMinutes ?? occurrence.timeConsumed ?? null,
      targetTimeConsumption: occurrenceV2.targetTimeMinutes ?? occurrence.targetTimeConsumption ?? null,
      targetDate: occurrenceV2.tentativeAt ?? occurrence.targetDate ?? null,
      limitDate: occurrenceV2.dueAt ?? occurrence.limitDate ?? null,
    });
  };

  return {
    // State
    selectedTaskId,
    setSelectedTaskId,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    confirmAction,
    setConfirmAction,
    editingOccurrence,
    setEditingOccurrence,
    
    // Data
    allOccurrences,
    occurrences,
    groupedOccurrences,
    sortedTasks,
    totalTasksCount,
    nextOccurrenceDate,
    isLoading,
    
    // Mutations
    completeOccurrence,
    skipOccurrence,
    updateOccurrence,
    skipBacklog,
    
    // Handlers
    handleConfirmAction,
    handleSaveOccurrence,
    handleTimelineOccurrenceClick,
    handleTimelineComplete,
    handleTimelineSkip,
    handleTimelineEdit,
  };
}
