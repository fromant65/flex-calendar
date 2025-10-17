"use client"

import { Plus } from "lucide-react"

interface TasksHeaderProps {
  onCreateClick: () => void
}

export function TasksHeader({ onCreateClick }: TasksHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestor de Tareas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Crea y administra tus tareas y hábitos</p>
          </div>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Nueva Tarea
          </button>
        </div>
      </div>
    </header>
  )
}
