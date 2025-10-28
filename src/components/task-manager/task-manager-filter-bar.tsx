"use client"

import { Input } from "~/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { TaskOccurrenceStatus, TaskType } from "~/types";

export type TaskManagerFilter = {
  searchQuery: string;
  statusFilter: TaskOccurrenceStatus | "all";
  taskTypeFilter: TaskType | "all";
};

interface TaskManagerFilterBarProps {
  filters: TaskManagerFilter;
  onFiltersChange: (filters: TaskManagerFilter) => void;
  totalTasks: number;
  filteredCount: number;
}

const taskTypes: (TaskType | "all")[] = [
  "all",
  "Única",
  "Recurrente Finita",
  "Hábito",
  "Hábito +",
  "Fija Única",
  "Fija Repetitiva",
];

const statusOptions: (TaskOccurrenceStatus | "all")[] = [
  "all",
  "Pending",
  "In Progress",
  "Completed",
  "Skipped",
];

const statusLabels: Record<TaskOccurrenceStatus | "all", string> = {
  all: "Todos los estados",
  Pending: "Pendiente",
  "In Progress": "En Progreso",
  Completed: "Completada",
  Skipped: "Saltada",
};

export function TaskManagerFilterBar({
  filters,
  onFiltersChange,
  totalTasks,
  filteredCount,
}: TaskManagerFilterBarProps) {
  const hasActiveFilters = 
    filters.searchQuery !== "" || 
    filters.statusFilter !== "all" || 
    filters.taskTypeFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de tarea..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.statusFilter}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              statusFilter: value as TaskOccurrenceStatus | "all",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Task Type Filter */}
        <Select
          value={filters.taskTypeFilter}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              taskTypeFilter: value as TaskType | "all",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tipo de tarea" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {taskTypes.slice(1).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredCount} de {totalTasks} tarea{totalTasks !== 1 ? "s" : ""}
          </span>
          {filters.searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: "{filters.searchQuery}"
            </Badge>
          )}
          {filters.statusFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Estado: {statusLabels[filters.statusFilter]}
            </Badge>
          )}
          {filters.taskTypeFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Tipo: {filters.taskTypeFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
