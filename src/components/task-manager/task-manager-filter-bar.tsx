"use client"

import { motion } from "framer-motion"
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
import { Button } from "~/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "~/components/ui/dropdown-menu";
import { ArrowUpDown, Check } from "lucide-react";
import type { TaskOccurrenceStatus, TaskType } from "~/types";

export type SortOption = 
  | "closest-target" 
  | "closest-limit" 
  | "importance" 
  | "name" 
  | "time-allocated";

export type TaskManagerFilter = {
  searchQuery: string;
  statusFilter: TaskOccurrenceStatus | "all";
  taskTypeFilter: TaskType | "all";
  sortBy: SortOption;
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

const sortLabels: Record<SortOption, string> = {
  "closest-target": "Fecha objetivo",
  "closest-limit": "Fecha límite",
  "importance": "Importancia",
  "name": "Nombre (A-Z)",
  "time-allocated": "Tiempo asignado",
};

const sortLabelsLong: Record<SortOption, string> = {
  "closest-target": "Fecha objetivo cercana",
  "closest-limit": "Fecha límite cercana",
  "importance": "Importancia",
  "name": "Nombre (A-Z)",
  "time-allocated": "Tiempo asignado",
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
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Search and Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-sm">
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

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full lg:w-[200px] justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <ArrowUpDown className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm">{sortLabels[filters.sortBy]}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => onFiltersChange({ ...filters, sortBy: "closest-target" })}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{sortLabelsLong["closest-target"]}</span>
              {filters.sortBy === "closest-target" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onFiltersChange({ ...filters, sortBy: "closest-limit" })}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{sortLabelsLong["closest-limit"]}</span>
              {filters.sortBy === "closest-limit" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => onFiltersChange({ ...filters, sortBy: "importance" })}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{sortLabelsLong["importance"]}</span>
              {filters.sortBy === "importance" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onFiltersChange({ ...filters, sortBy: "name" })}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{sortLabelsLong["name"]}</span>
              {filters.sortBy === "name" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onFiltersChange({ ...filters, sortBy: "time-allocated" })}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{sortLabelsLong["time-allocated"]}</span>
              {filters.sortBy === "time-allocated" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
          <SelectTrigger className="w-full lg:w-[200px]">
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
          <SelectTrigger className="w-full lg:w-[200px]">
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
    </motion.div>
  );
}
