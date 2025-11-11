/**
 * Task Info Component
 * Displays task information card in modal
 */

import { Target } from "lucide-react"

interface TaskInfoProps {
  task: {
    name: string
    description: string | null
    importance: number
  }
}

export function TaskInfo({ task }: TaskInfoProps) {
  return (
    <div className="space-y-3">
      {task.description && (
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Descripción</h4>
          <p className="text-sm text-foreground">{task.description}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 p-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
          <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Importancia</p>
          <p className="text-sm font-semibold text-foreground">{task.importance}/10</p>
        </div>
      </div>
    </div>
  )
}
