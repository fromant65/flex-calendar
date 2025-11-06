import { useState } from "react"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskStats } from "./task-stats"

interface StatsSectionProps {
  tasks: TaskGetMyTasksOutput
}

export function StatsSection({ tasks }: StatsSectionProps) {
  const [showStats, setShowStats] = useState(false)

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Estadísticas
        </h2>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-sm text-primary hover:underline focus:outline-none cursor-pointer"
        >
          {showStats ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {showStats && (
        <div className="rounded-lg border border-border bg-card/20 p-6 backdrop-blur-sm">
          <TaskStats tasks={tasks} />
        </div>
      )}
    </div>
  )
}
