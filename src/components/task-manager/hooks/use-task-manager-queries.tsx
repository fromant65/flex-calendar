import { useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { TaskManagerFilter } from "../task-manager-filter-bar";

export function useTaskManagerQueries(
  selectedTaskId: number | null,
  filters: TaskManagerFilter
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
      
      // Status filter
      if (filters.statusFilter !== "all" && occ.status !== filters.statusFilter) {
        return false;
      }
      
      // Task type filter
      if (filters.taskTypeFilter !== "all" && 'taskType' in occ.task && occ.task.taskType !== filters.taskTypeFilter) {
        return false;
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
