/**
 * Unified Filter Types
 * Central type definitions for filters used across all pages
 */

import type { TaskType, TaskOccurrenceStatus } from "./index"

// Sort options for Task Manager
export type SortOption = 
  | "closest-target" 
  | "closest-limit" 
  | "importance" 
  | "name-asc"
  | "name-desc"
  | "type"
  | "time-allocated"

// Priority filter based on Eisenhower Matrix
export type PriorityFilter = 
  | "urgent-important" 
  | "not-urgent-important" 
  | "urgent-not-important" 
  | "not-urgent-not-important"

// Status filter types
export type StatusFilter = 
  | "active" 
  | "inactive" 
  | "has-pending" 
  | "has-completed" 
  | "has-skipped" 
  | "all-completed"

// Fixed/Flexible filter
export type FixedFilter = "fixed" | "flexible"

// Active/Inactive filter
export type ActiveStatusFilter = "active" | "inactive"

/**
 * Unified Filter Configuration
 * Defines which filters are enabled for each page
 */
export interface UnifiedFilterConfig {
  enableSearch?: boolean
  enableTaskType?: boolean
  enableMultiTaskType?: boolean // Allow selecting multiple task types
  enablePriority?: boolean
  enableMultiPriority?: boolean // Allow selecting multiple priorities
  enableStatus?: boolean
  enableMultiStatus?: boolean // Allow selecting multiple statuses
  enableTaskOccurrenceStatus?: boolean
  enableMultiTaskOccurrenceStatus?: boolean
  enableFixed?: boolean
  enableActiveStatus?: boolean
  enableSort?: boolean
  enableDateRange?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
}

/**
 * Unified Filter State
 * Contains all possible filter values with proper typing
 */
export interface UnifiedFilters {
  // Search
  searchQuery: string
  
  // Task Type - supports both single and multi-select
  taskTypeFilter: TaskType | "all"
  taskTypesFilter: TaskType[] // For multi-select
  
  // Priority - supports both single and multi-select
  priorityFilter: PriorityFilter | "all"
  prioritiesFilter: PriorityFilter[] // For multi-select
  
  // Status - supports both single and multi-select
  statusFilter: StatusFilter | "all"
  statusesFilter: StatusFilter[] // For multi-select
  
  // Task Occurrence Status - supports both single and multi-select
  taskOccurrenceStatusFilter: TaskOccurrenceStatus | "all"
  taskOccurrenceStatusesFilter: TaskOccurrenceStatus[] // For multi-select
  
  // Fixed/Flexible
  fixedFilter: FixedFilter | "all"
  
  // Active/Inactive
  activeStatusFilter: ActiveStatusFilter | "all"
  
  // Sort
  sortBy: SortOption
  
  // Date Range
  dateRangeStart: Date | null
  dateRangeEnd: Date | null
}

/**
 * Default filter values
 */
export const defaultFilters: UnifiedFilters = {
  searchQuery: "",
  taskTypeFilter: "all",
  taskTypesFilter: [],
  priorityFilter: "all",
  prioritiesFilter: [],
  statusFilter: "all",
  statusesFilter: [],
  taskOccurrenceStatusFilter: "all",
  taskOccurrenceStatusesFilter: [],
  fixedFilter: "all",
  activeStatusFilter: "all",
  sortBy: "closest-target",
  dateRangeStart: null,
  dateRangeEnd: null,
}

/**
 * Helper type to create page-specific filter types
 * Picks only the relevant fields based on config
 */
export type PageFilters<T extends Partial<UnifiedFilters>> = {
  [K in keyof T]: T[K]
}

/**
 * Label mappings for filter options
 */
export const priorityLabels: Record<PriorityFilter | "all", string> = {
  all: "Todas las prioridades",
  "urgent-important": "Urgente e Importante",
  "not-urgent-important": "No Urgente e Importante",
  "urgent-not-important": "Urgente y No Importante",
  "not-urgent-not-important": "No Urgente y No Importante",
}

export const statusLabels: Record<StatusFilter | "all", string> = {
  all: "Todos los estados",
  active: "Activas",
  inactive: "Inactivas",
  "has-pending": "Con pendientes",
  "has-completed": "Con completadas",
  "has-skipped": "Con salteadas",
  "all-completed": "Todo completado",
}

export const taskOccurrenceStatusLabels: Record<TaskOccurrenceStatus | "all", string> = {
  all: "Todos los estados",
  Pending: "Pendiente",
  "In Progress": "En Progreso",
  Completed: "Completada",
  Skipped: "Saltada",
}

export const fixedLabels: Record<FixedFilter | "all", string> = {
  all: "Todas",
  fixed: "Fijas",
  flexible: "Flexibles",
}

export const activeStatusLabels: Record<ActiveStatusFilter | "all", string> = {
  all: "Todas",
  active: "Activas",
  inactive: "Inactivas",
}

export const sortLabels: Record<SortOption, string> = {
  "closest-target": "Fecha objetivo",
  "closest-limit": "Fecha límite",
  "importance": "Importancia",
  "name-asc": "Nombre (A-Z)",
  "name-desc": "Nombre (Z-A)",
  "type": "Tipo",
  "time-allocated": "Tiempo asignado",
}

export const sortLabelsLong: Record<SortOption, string> = {
  "closest-target": "Fecha objetivo cercana",
  "closest-limit": "Fecha límite cercana",
  "importance": "Importancia",
  "name-asc": "Nombre (A-Z)",
  "name-desc": "Nombre (Z-A)",
  "type": "Tipo de tarea",
  "time-allocated": "Tiempo asignado",
}

export const taskTypeLabels: Record<TaskType | "all", string> = {
  all: "Todos los tipos",
  "Única": "Única",
  "Recurrente Finita": "Recurrente Finita",
  "Hábito": "Hábito",
  "Hábito +": "Hábito +",
  "Fija Única": "Fija Única",
  "Fija Repetitiva": "Fija Repetitiva",
}

/**
 * Available options arrays
 */
export const taskTypes: TaskType[] = [
  "Única",
  "Recurrente Finita",
  "Hábito",
  "Hábito +",
  "Fija Única",
  "Fija Repetitiva",
]

export const priorityOptions: PriorityFilter[] = [
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
]

export const statusOptions: StatusFilter[] = [
  "active",
  "inactive",
  "has-pending",
  "has-completed",
  "has-skipped",
  "all-completed",
]

export const taskOccurrenceStatusOptions: TaskOccurrenceStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
  "Skipped",
]

export const fixedOptions: FixedFilter[] = ["fixed", "flexible"]

export const activeStatusOptions: ActiveStatusFilter[] = ["active", "inactive"]

export const sortOptions: SortOption[] = [
  "closest-target",
  "closest-limit",
  "importance",
  "name-asc",
  "name-desc",
  "type",
  "time-allocated",
]
