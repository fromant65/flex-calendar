import { useState } from "react"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskCard } from "./task-card"

type TaskFromList = TaskGetMyTasksOutput[number]

interface InactiveTasksSectionProps {
  tasks: TaskFromList[]
  onEdit: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onView: (task: TaskFromList) => void
}

export function InactiveTasksSection({
  tasks,
  onEdit,
  onDelete,
  onView,
}: InactiveTasksSectionProps) {
  const [showInactiveTasks, setShowInactiveTasks] = useState(false)

  if (tasks.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          Tareas Inactivas
          <span className="ml-2 text-sm font-normal">
            ({tasks.length})
          </span>
        </h2>
        <button
          onClick={() => setShowInactiveTasks(!showInactiveTasks)}
          className="text-sm text-primary hover:underline focus:outline-none cursor-pointer"
        >
          {showInactiveTasks ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {showInactiveTasks && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}
