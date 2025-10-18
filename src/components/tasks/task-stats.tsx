"use client"

import { Calendar } from "lucide-react"

interface TaskStatsProps {
  totalTasks: number
  activeTasks: number
  fixedTasks: number
}

export function TaskStats({ totalTasks, activeTasks, fixedTasks }: TaskStatsProps) {
  return (
    <div className="mb-6 hidden gap-4 sm:grid sm:grid-cols-3">
      <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total de Tareas</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalTasks}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tareas Activas</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{activeTasks}</p>
          </div>
          <div className="rounded-full bg-green-500/10 p-3">
            <Calendar className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tareas Fijas</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{fixedTasks}</p>
          </div>
          <div className="rounded-full bg-blue-500/10 p-3">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
