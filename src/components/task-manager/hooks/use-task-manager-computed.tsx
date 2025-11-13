import { useMemo } from "react";
import type { OccurrenceWithTask } from "~/types";
import type { UnifiedFilters } from "~/types/filters";

export type TaskWithOccurrences = {
  task: OccurrenceWithTask['task'];
  occurrences: OccurrenceWithTask[];
};

export function useTaskManagerComputed(
  allOccurrences: OccurrenceWithTask[] | undefined,
  occurrences: OccurrenceWithTask[],
  filters: UnifiedFilters
) {
  // Group occurrences by task (filter out inactive tasks)
  const groupedOccurrences = useMemo(() => {
    if (!occurrences) return new Map();
    
    const grouped = new Map<number, typeof occurrences>();
    
    occurrences.forEach((occ) => {
      // Skip inactive tasks
      if (!occ.task.isActive) return;
      
      const taskId = occ.task.id;
      if (!grouped.has(taskId)) {
        grouped.set(taskId, []);
      }
      grouped.get(taskId)!.push(occ);
    });
    
    // Sort occurrences within each task by startDate
    grouped.forEach((occs) => {
      occs.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
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
            .filter(o => o.status === "Pending" || o.status === "In Progress")
            .map(o => o.targetDate ? new Date(o.targetDate).getTime() : Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          const bTarget = b.occurrences
            .filter(o => o.status === "Pending" || o.status === "In Progress")
            .map(o => o.targetDate ? new Date(o.targetDate).getTime() : Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          return aTarget - bTarget;
        }
        
        case "closest-limit": {
          const aLimit = a.occurrences
            .filter(o => o.status === "Pending" || o.status === "In Progress")
            .map(o => o.limitDate ? new Date(o.limitDate).getTime() : Infinity)
            .sort((x, y) => x - y)[0] ?? Infinity;
          
          const bLimit = b.occurrences
            .filter(o => o.status === "Pending" || o.status === "In Progress")
            .map(o => o.limitDate ? new Date(o.limitDate).getTime() : Infinity)
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
            .filter(o => o.status === "Pending" || o.status === "In Progress")
            .reduce((sum, o) => sum + (o.targetTimeConsumption ?? 0), 0) / 
            Math.max(1, a.occurrences.filter(o => o.status === "Pending" || o.status === "In Progress").length);
          
          const bAvgTime = b.occurrences
            .filter(o => o.status === "Pending" || o.status === "In Progress")
            .reduce((sum, o) => sum + (o.targetTimeConsumption ?? 0), 0) / 
            Math.max(1, b.occurrences.filter(o => o.status === "Pending" || o.status === "In Progress").length);
          
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
        .filter(occ => occ.task.isActive)
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
