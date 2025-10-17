"use client"

import { Pencil, Trash2, Calendar, Repeat, Target, Clock } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"

type TaskFromList = TaskGetMyTasksOutput[number]

interface TaskCardProps {
  task: TaskFromList
  onEdit: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onClick: (task: TaskFromList) => void
}

export function TaskCard({ task, onEdit, onDelete, onClick }: TaskCardProps) {
  const getTaskTypeIcon = () => {
    if (!task.recurrence || task.recurrence.maxOccurrences === 1) return <Calendar className="h-4 w-4" />
    if (task.recurrence.maxOccurrences && task.recurrence.maxOccurrences > 1 && !task.recurrence.interval) {
      return <Repeat className="h-4 w-4" />
    }
    return <Target className="h-4 w-4" />
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  return (
    <div
      onClick={() => onClick(task)}
      className="group cursor-pointer rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">{getTaskTypeIcon()}</div>
          <Badge variant="outline" className="text-xs">
            {task.taskType}
          </Badge>
          {task.isFixed && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Fija
            </Badge>
          )}
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="rounded-lg border border-border bg-background p-2 text-foreground transition-colors hover:bg-muted cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <h3 className="mb-2 font-semibold text-foreground line-clamp-1">{task.name}</h3>

      {task.description && <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{task.description}</p>}

      {task.isFixed && task.fixedStartTime && task.fixedEndTime && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {formatTime(task.fixedStartTime)} - {formatTime(task.fixedEndTime)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Importancia</span>
            <span className="font-semibold text-primary">{task.importance}/10</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${task.importance * 10}%` }}
            />
          </div>
        </div>
        {!task.isActive && (
          <Badge variant="destructive" className="text-xs">
            Inactiva
          </Badge>
        )}
      </div>
    </div>
  )
}
