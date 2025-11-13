import { useState } from "react";
import type { UnifiedFilters } from "~/types/filters";
import { defaultFilters } from "~/types/filters";

export function useTaskManagerState() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [filters, setFilters] = useState<UnifiedFilters>(defaultFilters);
  const [confirmAction, setConfirmAction] = useState<{
    type: "complete" | "skip";
    occurrenceId: number;
    taskName: string;
  } | null>(null);
  const [editingOccurrence, setEditingOccurrence] = useState<{
    id: number;
    timeConsumed: number | null;
    targetTimeConsumption: number | null;
    targetDate: Date | null;
    limitDate: Date | null;
  } | null>(null);

  return {
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
  };
}
