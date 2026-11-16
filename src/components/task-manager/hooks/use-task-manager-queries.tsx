import { useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { UnifiedFilters } from "~/types/filters";
import { calculateQuadrant } from "~/lib/eisenhower-utils";

const normalizeOccurrenceStatus = (status: string): string => {
  return status.toLowerCase().replace(/\s+/g, "_")
}

type TaskLike = {
  taskType?: string
  isFixed?: boolean
  recurrence?: { maxOccurrences?: number | null } | null
}

const deriveTaskType = (task: TaskLike): string | null => {
  const explicitType = task.taskType
  if (typeof explicitType === "string" && explicitType.length > 0) return explicitType

  const isFixed = task.isFixed === true
  const recurrence = task.recurrence as { maxOccurrences?: number | null } | undefined
  const hasRecurrence = !!recurrence
  const maxOccurrences = recurrence?.maxOccurrences ?? null

  if (isFixed && hasRecurrence) return "Fija Repetitiva"
  if (isFixed) return "Fija Única"
  if (typeof maxOccurrences === "number" && maxOccurrences > 1) return "Recurrente Finita"
  if (hasRecurrence) return "Hábito"
  return "Única"
}

export function useTaskManagerQueries(
  selectedTaskId: number | null,
  filters: UnifiedFilters
) {
  // Fetch all occurrences with task details (no filters - get all data)
  const { 
    data: allOccurrences, 
    isLoading, 
    error: occurrencesError 
  } = api.occurrence.getMyOccurrencesWithTask.useQuery();
  
  // Apply filters on the frontend
  const occurrences = useMemo(() => {
    if (!allOccurrences) return [];
    
    return allOccurrences.filter((occ) => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesName = occ.task.name.toLowerCase().includes(searchLower);
        if (!matchesName) return false;
      }
      
      // Status filter - multi-select support
      if (filters.taskOccurrenceStatusesFilter.length > 0) {
        const normalizedStatus = normalizeOccurrenceStatus(occ.status)
        const selectedStatuses = filters.taskOccurrenceStatusesFilter.map(normalizeOccurrenceStatus)
        if (!selectedStatuses.includes(normalizedStatus)) return false;
      } else if (filters.taskOccurrenceStatusFilter !== "all") {
        // Fallback to single select
        const normalizedStatus = normalizeOccurrenceStatus(occ.status)
        const selectedStatus = normalizeOccurrenceStatus(filters.taskOccurrenceStatusFilter)
        if (normalizedStatus !== selectedStatus) return false;
      }
      
      // Task type filter - multi-select support
      if (filters.taskTypesFilter.length > 0) {
        const taskType = deriveTaskType(occ.task as TaskLike) as (typeof filters.taskTypesFilter)[number]
        if (!taskType || !filters.taskTypesFilter.includes(taskType)) return false;
      } else if (filters.taskTypeFilter !== "all") {
        // Fallback to single select
        const taskType = deriveTaskType(occ.task as TaskLike) as typeof filters.taskTypeFilter
        if (!taskType || taskType !== filters.taskTypeFilter) return false;
      }
      
      // Priority filter - multi-select support (using Eisenhower matrix)
      if (filters.prioritiesFilter.length > 0) {
        const quadrant = calculateQuadrant(occ).quadrant
        const matchesPriority = filters.prioritiesFilter.includes(quadrant)
        if (!matchesPriority) return false
      }
      
      return true;
    });
  }, [allOccurrences, filters]);
  
  // Get next occurrence preview for selected task
  const { 
    data: nextOccurrenceDate, 
    error: nextOccurrenceError 
  } = api.task.previewNextOccurrence.useQuery(
    { id: selectedTaskId! },
    { enabled: !!selectedTaskId }
  );

  // Show error toasts for queries
  useEffect(() => {
    if (occurrencesError) {
      toast.error("Error al cargar ocurrencias", { 
        description: occurrencesError.message || "No se pudieron cargar las ocurrencias" 
      });
      console.error("Error fetching occurrences:", occurrencesError);
    }
    if (nextOccurrenceError) {
      toast.error("Error al obtener próxima ocurrencia", { 
        description: nextOccurrenceError.message || "No se pudo obtener la próxima ocurrencia" 
      });
      console.error("Error fetching next occurrence preview:", nextOccurrenceError);
    }
  }, [occurrencesError, nextOccurrenceError]);

  return {
    allOccurrences,
    occurrences,
    nextOccurrenceDate,
    isLoading,
  };
}
