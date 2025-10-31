"use client"

import { Calendar, TrendingUp, CheckCircle2, Clock, Repeat, Zap, Target, Activity } from "lucide-react"
import type { TaskWithDetails } from "~/types"

interface TaskStatsProps {
  tasks: TaskWithDetails[]
}

export function TaskStats({ tasks }: TaskStatsProps) {
  // Calcular estadísticas generales
  const totalTasks = tasks.length
  const activeTasks = tasks.filter((t) => t.isActive).length
  const inactiveTasks = tasks.filter((t) => !t.isActive).length
  const fixedTasks = tasks.filter((t) => t.isFixed).length
  const flexibleTasks = tasks.filter((t) => !t.isFixed).length

  // Calcular estadísticas por tipo (total, activas, inactivas)
  const tasksByType = {
    "Única": {
      total: tasks.filter((t) => t.taskType === "Única").length,
      active: tasks.filter((t) => t.taskType === "Única" && t.isActive).length,
      inactive: tasks.filter((t) => t.taskType === "Única" && !t.isActive).length,
    },
    "Recurrente Finita": {
      total: tasks.filter((t) => t.taskType === "Recurrente Finita").length,
      active: tasks.filter((t) => t.taskType === "Recurrente Finita" && t.isActive).length,
      inactive: tasks.filter((t) => t.taskType === "Recurrente Finita" && !t.isActive).length,
    },
    "Hábito": {
      total: tasks.filter((t) => t.taskType === "Hábito").length,
      active: tasks.filter((t) => t.taskType === "Hábito" && t.isActive).length,
      inactive: tasks.filter((t) => t.taskType === "Hábito" && !t.isActive).length,
    },
    "Hábito +": {
      total: tasks.filter((t) => t.taskType === "Hábito +" ).length,
      active: tasks.filter((t) => t.taskType === "Hábito +" && t.isActive).length,
      inactive: tasks.filter((t) => t.taskType === "Hábito +" && !t.isActive).length,
    },
    "Fija Única": {
      total: tasks.filter((t) => t.taskType === "Fija Única").length,
      active: tasks.filter((t) => t.taskType === "Fija Única" && t.isActive).length,
      inactive: tasks.filter((t) => t.taskType === "Fija Única" && !t.isActive).length,
    },
    "Fija Repetitiva": {
      total: tasks.filter((t) => t.taskType === "Fija Repetitiva").length,
      active: tasks.filter((t) => t.taskType === "Fija Repetitiva" && t.isActive).length,
      inactive: tasks.filter((t) => t.taskType === "Fija Repetitiva" && !t.isActive).length,
    },
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="Total de Tareas"
          value={totalTasks}
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tareas Activas"
          value={activeTasks}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Tareas Inactivas"
          value={inactiveTasks}
          color="orange"
        />
        <StatCard
          icon={Target}
          label="Tareas Fijas"
          value={fixedTasks}
          color="blue"
        />
      </div>

      {/* Estadísticas por Tipo */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Distribución por Tipo</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TypeStatCard
            label="Única"
            total={tasksByType["Única"].total}
            active={tasksByType["Única"].active}
            inactive={tasksByType["Única"].inactive}
            icon={Zap}
            color="chart-3"
          />
          <TypeStatCard
            label="Recurrente Finita"
            total={tasksByType["Recurrente Finita"].total}
            active={tasksByType["Recurrente Finita"].active}
            inactive={tasksByType["Recurrente Finita"].inactive}
            icon={Repeat}
            color="chart-5"
          />
          <TypeStatCard
            label="Hábito"
            total={tasksByType["Hábito"].total}
            active={tasksByType["Hábito"].active}
            inactive={tasksByType["Hábito"].inactive}
            icon={TrendingUp}
            color="chart-2"
          />
          <TypeStatCard
            label="Hábito +"
            total={tasksByType["Hábito +"].total}
            active={tasksByType["Hábito +"].active}
            inactive={tasksByType["Hábito +"].inactive}
            icon={Activity}
            color="chart-4"
          />
          <TypeStatCard
            label="Fija Única"
            total={tasksByType["Fija Única"].total}
            active={tasksByType["Fija Única"].active}
            inactive={tasksByType["Fija Única"].inactive}
            icon={Target}
            color="chart-1"
          />
          <TypeStatCard
            label="Fija Repetitiva"
            total={tasksByType["Fija Repetitiva"].total}
            active={tasksByType["Fija Repetitiva"].active}
            inactive={tasksByType["Fija Repetitiva"].inactive}
            icon={Repeat}
            color="orange"
          />
        </div>
      </div>

      {/* Barra de Progreso Visual */}
      {totalTasks > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Estado General</h3>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {activeTasks > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(activeTasks / totalTasks) * 100}%` }}
                title={`${activeTasks} activas (${Math.round((activeTasks / totalTasks) * 100)}%)`}
              />
            )}
            {inactiveTasks > 0 && (
              <div
                className="bg-orange-500 transition-all"
                style={{ width: `${(inactiveTasks / totalTasks) * 100}%` }}
                title={`${inactiveTasks} inactivas (${Math.round((inactiveTasks / totalTasks) * 100)}%)`}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {activeTasks} Activas ({Math.round((activeTasks / totalTasks) * 100)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              {inactiveTasks} Inactivas ({Math.round((inactiveTasks / totalTasks) * 100)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para las tarjetas de estadísticas principales
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: "primary" | "green" | "orange" | "blue"
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-500",
    orange: "bg-orange-500/10 text-orange-500",
    blue: "bg-blue-500/10 text-blue-500",
  }

  return (
    <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:bg-card/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// Componente para las tarjetas de tipo de tarea
function TypeStatCard({
  label,
  total,
  active,
  inactive,
  icon: Icon,
  color,
}: {
  label: string
  total: number
  active: number
  inactive: number
  icon: React.ElementType
  color: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "orange"
}) {
  const colorClasses = {
    "chart-1": "bg-chart-1/10 text-chart-1 border-chart-1/30",
    "chart-2": "bg-chart-2/10 text-chart-2 border-chart-2/30",
    "chart-3": "bg-chart-3/10 text-chart-3 border-chart-3/30",
    "chart-4": "bg-chart-4/10 text-chart-4 border-chart-4/30",
    "chart-5": "bg-chart-5/10 text-chart-5 border-chart-5/30",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  }

  // Colores para la barra de progreso adaptados a cada tipo
  const progressColors = {
    "chart-1": { active: "bg-chart-1", inactive: "bg-chart-1/40" },
    "chart-2": { active: "bg-chart-2", inactive: "bg-chart-2/40" },
    "chart-3": { active: "bg-chart-3", inactive: "bg-chart-3/40" },
    "chart-4": { active: "bg-chart-4", inactive: "bg-chart-4/40" },
    "chart-5": { active: "bg-chart-5", inactive: "bg-chart-5/40" },
    orange: { active: "bg-orange-600 dark:bg-orange-500", inactive: "bg-orange-600/40 dark:bg-orange-500/40" },
  }

  // Colores para los indicadores (círculos pequeños)
  const indicatorColors = {
    "chart-1": { active: "bg-chart-1", inactive: "bg-chart-1/50" },
    "chart-2": { active: "bg-chart-2", inactive: "bg-chart-2/50" },
    "chart-3": { active: "bg-chart-3", inactive: "bg-chart-3/50" },
    "chart-4": { active: "bg-chart-4", inactive: "bg-chart-4/50" },
    "chart-5": { active: "bg-chart-5", inactive: "bg-chart-5/50" },
    orange: { active: "bg-orange-600 dark:bg-orange-500", inactive: "bg-orange-600/50 dark:bg-orange-500/50" },
  }

  const activePercentage = total > 0 ? (active / total) * 100 : 0
  const inactivePercentage = total > 0 ? (inactive / total) * 100 : 0

  return (
    <div
      className={`group rounded-lg border p-3 backdrop-blur-sm transition-all hover:scale-105 ${colorClasses[color]}`}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <span className="text-lg font-bold">{total}</span>
        </div>

        {/* Progress Bar */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              {active > 0 && (
                <div
                  className={`${progressColors[color].active} transition-all`}
                  style={{ width: `${activePercentage}%` }}
                  title={`${active} activas`}
                />
              )}
              {inactive > 0 && (
                <div
                  className={`${progressColors[color].inactive} transition-all`}
                  style={{ width: `${inactivePercentage}%` }}
                  title={`${inactive} inactivas`}
                />
              )}
            </div>
            
            {/* Stats */}
            <div className="flex justify-between text-xs opacity-80">
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${indicatorColors[color].active}`} />
                {active} activas
              </span>
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${indicatorColors[color].inactive}`} />
                {inactive} inactivas
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
