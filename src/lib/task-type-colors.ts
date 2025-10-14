/**
 * Task Type Color Utilities
 * Maps task types to their corresponding color schemes
 */

import type { TaskType } from "~/types"

interface TaskTypeColors {
  bg: string
  bgHover: string
  border: string
  ring: string
  text: string
}

/**
 * Get color classes for a given task type
 * - Única: Azul (chart-3) - Tareas puntuales y definidas
 * - Recurrente Finita: Cyan (chart-5) - Flujo con final
 * - Hábito: Verde (chart-2) - Crecimiento y constancia
 * - Hábito +: Magenta (chart-4) - Hábitos avanzados
 * - Fija Única: Naranja (chart-1) - Eventos fijos puntuales
 * - Fija Repetitiva: Naranja oscuro (orange-600) - Eventos fijos recurrentes
 */
export function getTaskTypeColors(taskType: TaskType | undefined | null): TaskTypeColors {
  switch (taskType) {
    case "Única":
      return {
        bg: "bg-chart-3/20",
        bgHover: "bg-chart-3/30",
        border: "border-chart-3",
        ring: "ring-chart-3",
        text: "text-chart-3",
      }
    case "Recurrente Finita":
      return {
        bg: "bg-chart-5/20",
        bgHover: "bg-chart-5/30",
        border: "border-chart-5",
        ring: "ring-chart-5",
        text: "text-chart-5",
      }
    case "Hábito":
      return {
        bg: "bg-chart-2/20",
        bgHover: "bg-chart-2/30",
        border: "border-chart-2",
        ring: "ring-chart-2",
        text: "text-chart-2",
      }
    case "Hábito +":
      return {
        bg: "bg-chart-4/20",
        bgHover: "bg-chart-4/30",
        border: "border-chart-4",
        ring: "ring-chart-4",
        text: "text-chart-4",
      }
    case "Fija Única":
      return {
        bg: "bg-chart-1/20",
        bgHover: "bg-chart-1/30",
        border: "border-chart-1",
        ring: "ring-chart-1",
        text: "text-chart-1",
      }
    case "Fija Repetitiva":
      return {
        bg: "bg-orange-500/20",
        bgHover: "bg-orange-500/30",
        border: "border-orange-600",
        ring: "ring-orange-600",
        text: "text-orange-700 dark:text-orange-400",
      }
    default:
      // Fallback to neutral colors if taskType is not recognized
      return {
        bg: "bg-muted/50",
        bgHover: "bg-muted",
        border: "border-muted-foreground",
        ring: "ring-muted-foreground",
        text: "text-muted-foreground",
      }
  }
}

/**
 * Get combined className string for task type styling
 */
export function getTaskTypeClassName(
  taskType: TaskType | undefined | null,
  options: {
    includeHover?: boolean
    includeRing?: boolean
    isSelected?: boolean
  } = {}
): string {
  const colors = getTaskTypeColors(taskType)
  const { includeHover = true, includeRing = true, isSelected = false } = options

  const classes = [
    colors.bg,
    `border-l-2 ${colors.border}`,
    includeHover && `hover:${colors.bgHover}`,
    includeRing && isSelected && `ring-2 ${colors.ring}`,
  ].filter(Boolean)

  return classes.join(" ")
}
