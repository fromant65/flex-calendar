"use client";

import { LoadingPage } from "~/components/ui/loading-spinner";
import {
  TaskManagerHeader,
  TaskManagerListView,
  TaskManagerEmptyState,
  TaskManagerTimeline,
  ConfirmActionDialog,
  EditOccurrenceDialog,
  useTaskManagerData,
} from "~/components/task-manager";

export default function TaskManagerPage() {
  const {
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
  } = useTaskManagerData();
  
  // Show loading spinner while fetching data
  if (isLoading) {
    return <LoadingPage text="Cargando ocurrencias..." />;
  }

  // True empty state - no occurrences at all (not just filtered out)
  if (!allOccurrences || allOccurrences.length === 0) {
    return <TaskManagerEmptyState type="no-occurrences" />;
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <TaskManagerHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content - Timeline View */}
      {viewMode === "timeline" ? (
        <div className="flex-1 min-h-0">
          <TaskManagerTimeline
            occurrences={occurrences ?? []}
            onOccurrenceClick={handleTimelineOccurrenceClick}
            onCompleteOccurrence={handleTimelineComplete}
            onSkipOccurrence={handleTimelineSkip}
            onEditOccurrence={handleTimelineEdit}
          />
        </div>
      ) : (
        /* Content - List View */
        <TaskManagerListView
          filters={filters}
          onFiltersChange={setFilters}
          totalTasksCount={totalTasksCount}
          groupedOccurrences={groupedOccurrences}
          sortedTasks={sortedTasks}
          selectedTaskId={selectedTaskId}
          nextOccurrenceDate={nextOccurrenceDate}
          onToggleTask={setSelectedTaskId}
          onEditOccurrence={(id, timeConsumed, targetTimeConsumption, targetDate, limitDate) =>
            setEditingOccurrence({ id, timeConsumed, targetTimeConsumption, targetDate, limitDate })
          }
          onCompleteOccurrence={(id, taskName) =>
            setConfirmAction({ type: "complete", occurrenceId: id, taskName })
          }
          onSkipOccurrence={(id, taskName) =>
            setConfirmAction({ type: "skip", occurrenceId: id, taskName })
          }
          onSkipBacklog={(taskId) => skipBacklog.mutate({ taskId })}
          isCompleting={completeOccurrence.isPending}
          isSkipping={skipOccurrence.isPending}
          isSkippingBacklog={skipBacklog.isPending}
        />
      )}

      {/* Dialogs */}
      <ConfirmActionDialog
        action={confirmAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={completeOccurrence.isPending || skipOccurrence.isPending}
      />

      <EditOccurrenceDialog
        occurrence={editingOccurrence}
        onSave={handleSaveOccurrence}
        onCancel={() => setEditingOccurrence(null)}
        isLoading={updateOccurrence.isPending}
      />
    </div>
  );
}
