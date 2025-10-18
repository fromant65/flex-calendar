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
    <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400">
        Información de la Tarea
      </h3>
      
      {task.description && (
        <div className="text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Descripción:</span>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{task.description}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Importancia:</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{task.importance}/10</span>
      </div>
    </div>
  )
}
