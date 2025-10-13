import type { OccurrenceWithTask, QuadrantPosition } from "./types"

export function calculateQuadrant(occurrence: OccurrenceWithTask): QuadrantPosition {
  const importance = occurrence.task.importance
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
      return "Do First"
    case "not-urgent-important":
      return "Schedule"
    case "urgent-not-important":
      return "Delegate"
    case "not-urgent-not-important":
      return "Eliminate"
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
  }
}
