import { motion } from "framer-motion";
import type { TaskType } from "~/server/api/services/types";
import type { OccurrenceWithTask } from "~/types";
import { TaskCard } from "./task-card";
import { TaskManagerFilterBar, type TaskManagerFilter } from "./task-manager-filter-bar";
import { TaskManagerEmptyState } from "./task-manager-empty-state";
import type { TaskWithOccurrences } from "./use-task-manager-data";

interface TaskManagerListViewProps {
  filters: TaskManagerFilter;
  onFiltersChange: (filters: TaskManagerFilter) => void;
  totalTasksCount: number;
  groupedOccurrences: Map<number, OccurrenceWithTask[]>;
  sortedTasks: TaskWithOccurrences[];
  selectedTaskId: number | null;
  nextOccurrenceDate: Date | null | undefined;
  onToggleTask: (taskId: number | null) => void;
  onEditOccurrence: (
    id: number,
    timeConsumed: number | null,
    targetTimeConsumption: number | null,
    targetDate: Date | null,
    limitDate: Date | null
  ) => void;
  onCompleteOccurrence: (id: number, taskName: string) => void;
  onSkipOccurrence: (id: number, taskName: string) => void;
  onSkipBacklog: (taskId: number) => void;
  isCompleting: boolean;
  isSkipping: boolean;
  isSkippingBacklog: boolean;
}

export function TaskManagerListView({
  filters,
  onFiltersChange,
  totalTasksCount,
  groupedOccurrences,
  sortedTasks,
  selectedTaskId,
  nextOccurrenceDate,
  onToggleTask,
  onEditOccurrence,
  onCompleteOccurrence,
  onSkipOccurrence,
  onSkipBacklog,
  isCompleting,
  isSkipping,
  isSkippingBacklog,
}: TaskManagerListViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 flex-1 pb-8">
      {/* Filter Bar - Always visible */}
      <div className="mb-6">
        <TaskManagerFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          totalTasks={totalTasksCount}
          filteredCount={groupedOccurrences.size}
        />
      </div>

      {/* Tasks List */}
      {groupedOccurrences.size === 0 ? (
        <TaskManagerEmptyState type="no-results" />
      ) : (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedTasks.map(({ task, occurrences: taskOccurrences }) => {
            const taskType = task.taskType as TaskType;
            const isExpanded = selectedTaskId === task.id;

            return (
              <TaskCard
                key={task.id}
                task={task}
                taskType={taskType}
                occurrences={taskOccurrences}
                isExpanded={isExpanded}
                nextOccurrenceDate={isExpanded ? nextOccurrenceDate : null}
                onToggle={() => onToggleTask(isExpanded ? null : task.id)}
                onEditOccurrence={(id, timeConsumed, targetTimeConsumption, targetDate, limitDate) =>
                  onEditOccurrence(id, timeConsumed, targetTimeConsumption, targetDate, limitDate)
                }
                onCompleteOccurrence={(id, taskName) =>
                  onCompleteOccurrence(id, taskName)
                }
                onSkipOccurrence={(id, taskName) =>
                  onSkipOccurrence(id, taskName)
                }
                onSkipBacklog={(taskId) => onSkipBacklog(taskId)}
                isCompleting={isCompleting}
                isSkipping={isSkipping}
                isSkippingBacklog={isSkippingBacklog}
              />
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
