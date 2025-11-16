"use client"

import React from "react"
import { TasksParams } from "./tasks/tasks-params"
import { TasksCreate } from "./tasks/tasks-create"
import { TasksCases } from "./tasks/tasks-cases"
import { TasksFilters } from "./tasks/tasks-filters"
import { TasksEdit } from "./tasks/tasks-edit"
import { TasksDeactivate } from "./tasks/tasks-deactivate"
import { TasksStats } from "./tasks/tasks-stats"

interface TasksContentProps {
  id: string
}

export function TasksContent({ id }: TasksContentProps) {
  switch (id) {
    case "tasks-params":
      return <TasksParams />
    case "tasks-create":
      return <TasksCreate />
    case "tasks-cases":
      return <TasksCases />
    case "tasks-filters":
      return <TasksFilters />
    case "tasks-edit":
      return <TasksEdit />
    case "tasks-deactivate":
      return <TasksDeactivate />
    case "tasks-stats":
      return <TasksStats />
    default:
      return null
  }
}
