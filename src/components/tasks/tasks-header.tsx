"use client"

import { Plus } from "lucide-react"
import HelpTip from "~/components/ui/help-tip"

interface TasksHeaderProps {
  onCreateClick: () => void
}

export function TasksHeader({ onCreateClick }: TasksHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Gestor de Tareas</h1>
              <HelpTip title="Ayuda - gestor de tareas">
                Aquí puedes ver tus tareas, crear nuevas y editarlas. 
                La tarea es la pieza central de organización en Flex Calendar.
                Al crear una tarea, se crearán ocurrencias basadas en su recurrencia. <br />
                Para completar una tarea, debes completar o saltar todas sus ocurrencias pendientes. <br />
                Los Hábitos y Hábitos+ no se pueden completar, ya que se repiten indefinidamente, pero puedes completar sus ocurrencias y ver estadísticas al respecto.
              </HelpTip>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Crea y administra tus tareas y hábitos</p>
          </div>
          <button
            onClick={onCreateClick}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 cursor-pointer sm:justify-start"
          >
            <Plus className="h-5 w-5" />
            Nueva Tarea
          </button>
        </div>
      </div>
    </header>
  )
}
