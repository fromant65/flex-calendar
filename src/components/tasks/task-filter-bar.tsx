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
import type { TaskType } from "~/types";

export type TaskFilter = {
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";
  taskTypeFilter: TaskType | "all";
  fixedFilter: "all" | "fixed" | "flexible";
};

interface TaskFilterBarProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
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

const statusOptions: ("all" | "active" | "inactive")[] = [
  "all",
  "active",
  "inactive",
];

const statusLabels: Record<"all" | "active" | "inactive", string> = {
  all: "Todas",
  active: "Activas",
  inactive: "Inactivas",
};

const fixedOptions: ("all" | "fixed" | "flexible")[] = [
  "all",
  "fixed",
  "flexible",
];

const fixedLabels: Record<"all" | "fixed" | "flexible", string> = {
  all: "Todas",
  fixed: "Fijas",
  flexible: "Flexibles",
};

export function TaskFilterBar({
  filters,
  onFiltersChange,
  totalTasks,
  filteredCount,
}: TaskFilterBarProps) {
  const hasActiveFilters = 
    filters.searchQuery !== "" || 
    filters.statusFilter !== "all" || 
    filters.taskTypeFilter !== "all" ||
    filters.fixedFilter !== "all";

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Search and Filters Row */}
      <div className="flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <Select
            value={filters.statusFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                statusFilter: value as "all" | "active" | "inactive",
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[150px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de tarea" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "Todos los tipos" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fixed Filter */}
          <Select
            value={filters.fixedFilter}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                fixedFilter: value as "all" | "fixed" | "flexible",
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fixedOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {fixedLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Counter */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredCount} de {totalTasks} tareas
          </Badge>
          <button
            onClick={() =>
              onFiltersChange({
                searchQuery: "",
                statusFilter: "all",
                taskTypeFilter: "all",
                fixedFilter: "all",
              })
            }
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </motion.div>
  );
}
