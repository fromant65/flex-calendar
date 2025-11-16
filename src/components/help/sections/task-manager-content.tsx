"use client"

import React from "react"
import { OccurrencesContent } from "./task-manager/occurrences"
import { RelationsContent } from "./task-manager/relations"
import { ListContent } from "./task-manager/list"
import { ListFiltersContent } from "./task-manager/list-filters"
import { ActionsContent } from "./task-manager/actions"
import { BacklogContent } from "./task-manager/backlog"
import { TimelineContent } from "./task-manager/timeline"

interface TaskManagerContentProps {
  id: string
}

export function TaskManagerContent({ id }: TaskManagerContentProps) {
  switch (id) {
    case "task-manager-ocurrences":
      return <OccurrencesContent />
    case "task-manager-relations":
      return <RelationsContent />
    case "task-manager":
    case "task-manager-list":
      return <ListContent />
    case "task-manager-list-filters":
      return <ListFiltersContent />
    case "task-manager-actions":
      return <ActionsContent />
    case "task-manager-backlog":
      return <BacklogContent />
    case "task-manager-timeline":
      return <TimelineContent />
    default:
      return null
  }
}
