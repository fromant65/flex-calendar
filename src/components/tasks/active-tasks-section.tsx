import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskCard } from "./task-card"

type TaskFromList = TaskGetMyTasksOutput[number]

interface ActiveTasksSectionProps {
  tasks: TaskFromList[]
  onEdit: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onView: (task: TaskFromList) => void
}

export function ActiveTasksSection({
  tasks,
  onEdit,
  onDelete,
  onView,
}: ActiveTasksSectionProps) {
  if (tasks.length === 0) return null

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">
        Tareas Activas
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({tasks.length})
        </span>
      </h2>
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
    </div>
  )
}
