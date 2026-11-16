import { useMemo } from "react";
import type { UnifiedFilters } from "~/types/filters";

export type TaskManagerOccurrenceLike = {
  id: number
  status: string
  completedAt?: Date | null
  startDate?: Date
  slotStartAt?: Date | null
  targetDate?: Date | null
  tentativeAt?: Date | null
  limitDate?: Date | null
  dueAt?: Date | null
  targetTimeConsumption?: number | null
  targetTimeMinutes?: number | null
  timeSpentMinutes?: number | null
  task: {
    id: number
    name: string
    importance?: number
    isActive?: boolean
    status?: string
    taskType?: string
  }
}

export type TaskWithOccurrences = {
  task: TaskManagerOccurrenceLike['task'];
  occurrences: TaskManagerOccurrenceLike[];
};

const normalizeStatus = (status: string): string => status.toLowerCase().replace(/\s+/g, "_")
const isActiveTask = (task: TaskManagerOccurrenceLike['task']): boolean => {
  if (typeof task.isActive === "boolean") return task.isActive
  return task.status === "active"
}
const getOccurrenceStart = (occ: TaskManagerOccurrenceLike): Date => occ.slotStartAt ?? occ.startDate ?? new Date(0)
const getTargetDate = (occ: TaskManagerOccurrenceLike): Date | null => occ.tentativeAt ?? occ.targetDate ?? null
const getLimitDate = (occ: TaskManagerOccurrenceLike): Date | null => occ.dueAt ?? occ.limitDate ?? null
const getTargetTime = (occ: TaskManagerOccurrenceLike): number => occ.targetTimeMinutes ?? occ.targetTimeConsumption ?? 0

export function useTaskManagerComputed(
  allOccurrences: TaskManagerOccurrenceLike[] | undefined,
  occurrences: TaskManagerOccurrenceLike[],
  filters: UnifiedFilters
) {
  // Group occurrences by task (filter out inactive tasks)
  const groupedOccurrences = useMemo(() => {
    if (!occurrences) return new Map();
    
    const grouped = new Map<number, typeof occurrences>();
    
    occurrences.forEach((occ) => {
      // Skip inactive tasks
      if (!isActiveTask(occ.task)) return;
      
      const taskId = occ.task.id;
      if (!grouped.has(taskId)) {
        grouped.set(taskId, []);
      }
      grouped.get(taskId)!.push(occ);
    });
    
    // Sort occurrences within each task by startDate
    grouped.forEach((occs) => {
      occs.sort((a, b) => getOccurrenceStart(a).getTime() - getOccurrenceStart(b).getTime());
    });
    
    return grouped;
  }, [occurrences]);

  // Sort tasks based on selected sort option
  const sortedTasks = useMemo(() => {
    const tasksArray: TaskWithOccurrences[] = Array.from(groupedOccurrences.entries()).map(
      ([taskId, taskOccurrences]) => ({
        task: taskOccurrences[0]!.task,
        occurrences: taskOccurrences,
      })
    );

    return tasksArray.sort((a, b) => {
      switch (filters.sortBy) {
        case "closest-target": {
          const aTarget = a.occurrences
            .filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            })
            .map(o => getTargetDate(o)?.getTime() ?? Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          const bTarget = b.occurrences
            .filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            })
            .map(o => getTargetDate(o)?.getTime() ?? Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          return aTarget - bTarget;
        }
        
        case "closest-limit": {
          const aLimit = a.occurrences
            .filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            })
            .map(o => getLimitDate(o)?.getTime() ?? Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          const bLimit = b.occurrences
            .filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            })
            .map(o => getLimitDate(o)?.getTime() ?? Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          return aLimit - bLimit;
        }
        
        case "importance": {
          return (b.task.importance ?? 0) - (a.task.importance ?? 0);
        }
        
        case "name-asc": {
          return a.task.name.localeCompare(b.task.name);
        }
        
        case "name-desc": {
          return b.task.name.localeCompare(a.task.name);
        }
        
        case "type": {
          const aType = 'taskType' in a.task ? (a.task.taskType ?? '') : '';
          const bType = 'taskType' in b.task ? (b.task.taskType ?? '') : '';
          return aType.localeCompare(bType);
        }
        
        case "time-allocated": {
          const aAvgTime = a.occurrences
            .filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            })
            .reduce((sum, o) => sum + getTargetTime(o), 0) /
            Math.max(1, a.occurrences.filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            }).length);
          
          const bAvgTime = b.occurrences
            .filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            })
            .reduce((sum, o) => sum + getTargetTime(o), 0) /
            Math.max(1, b.occurrences.filter(o => {
              const s = normalizeStatus(o.status)
              return s === "pending" || s === "in_progress"
            }).length);
          
          return bAvgTime - aAvgTime;
        }
        
        default:
          return 0;
      }
    });
  }, [groupedOccurrences, filters.sortBy]);

  // Calculate total tasks count (before filtering)
  const totalTasksCount = useMemo(() => {
    if (!allOccurrences) return 0;
    const uniqueTaskIds = new Set(
      allOccurrences
        .filter(occ => isActiveTask(occ.task))
        .map(occ => occ.task.id)
    );
    return uniqueTaskIds.size;
  }, [allOccurrences]);

  return {
    groupedOccurrences,
    sortedTasks,
    totalTasksCount,
  };
}
