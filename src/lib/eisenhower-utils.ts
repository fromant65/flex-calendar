import type { OccurrenceWithTask, QuadrantPosition } from "~/types"

export function calculateQuadrant(occurrence: OccurrenceWithTask): QuadrantPosition {
  const importance = occurrence.task?.importance || 0
  const urgency = occurrence.urgency || 0

  const isImportant = importance >= 6
  const isUrgent = urgency >= 6

  let quadrant: QuadrantPosition["quadrant"]

  if (isUrgent && isImportant) {
    quadrant = "urgent-important"
  } else if (!isUrgent && isImportant) {
    quadrant = "not-urgent-important"
  } else if (isUrgent && !isImportant) {
    quadrant = "urgent-not-important"
  } else {
    quadrant = "not-urgent-not-important"
  }

  return {
    quadrant,
    importance,
    urgency,
  }
}

export function getQuadrantLabel(quadrant: QuadrantPosition["quadrant"]): string {
  switch (quadrant) {
    case "urgent-important":
      return "Críticas"
    case "not-urgent-important":
      return "Programar"
    case "urgent-not-important":
      return "Delegar"
    case "not-urgent-not-important":
      return "Eliminar"
    default:
      return "Desconocido"
  }
}

export function getQuadrantColor(quadrant: QuadrantPosition["quadrant"]): string {
  switch (quadrant) {
    case "urgent-important":
      return "bg-red-500/10 border-red-500/30"
    case "not-urgent-important":
      return "bg-primary/10 border-primary/30"
    case "urgent-not-important":
      return "bg-yellow-500/10 border-yellow-500/30"
    case "not-urgent-not-important":
      return "bg-muted border-border"
    default:
      return "bg-muted border-border"
  }
}
