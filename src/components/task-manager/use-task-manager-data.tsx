import type { OccurrenceWithTask } from "~/types";
import { useTaskManagerState } from "./hooks/use-task-manager-state";
import { useTaskManagerQueries } from "./hooks/use-task-manager-queries";
import { useTaskManagerMutations } from "./hooks/use-task-manager-mutations";
import { useTaskManagerComputed } from "./hooks/use-task-manager-computed";

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
  } = useTaskManagerComputed(allOccurrences, occurrences, filters);

  // Timeline handlers
  const handleTimelineOccurrenceClick = (occurrence: OccurrenceWithTask) => {
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

  const handleTimelineEdit = (occurrence: OccurrenceWithTask) => {
    setEditingOccurrence({
      id: occurrence.id,
      timeConsumed: occurrence.timeConsumed,
      targetTimeConsumption: occurrence.targetTimeConsumption,
      targetDate: occurrence.targetDate,
      limitDate: occurrence.limitDate,
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
