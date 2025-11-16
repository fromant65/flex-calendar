"use client"

import { useState } from "react"
import { HelpSidebar } from "~/components/help/help-sidebar"
import { HelpContent } from "~/components/help/help-content"
import { Card } from "~/components/ui/card"
import { motion } from "framer-motion"

const sections = [
  {
    id: "dashboard",
    title: "Dashboard",
    children: [
      { id: "dashboard-overview", title: "Explicación de secciones" },
      { id: "dashboard-tasks", title: "Gestionar tareas desde el dashboard" },
    ],
  },
  {
    id: "tasks",
    title: "Página de Tareas",
    children: [
      { id: "tasks-params", title: "Parámetros de las tareas" },
      { id: "tasks-create", title: "Cómo crear cada tipo de tarea" },
      { id: "tasks-cases", title: "Casos de uso por tipo" },
      { id: "tasks-filters", title: "Filtros y casos de uso" },
      { id: "tasks-edit", title: "Editar y duplicar tareas" },
      { id: "tasks-deactivate", title: "Desactivar tareas y consecuencias" },
      { id: "tasks-stats", title: "Estadísticas de tareas" },
    ],
  },
  {
    id: "task-manager",
    title: "Gestor de Tareas",
    children: [
      { id: "task-manager-ocurrences", title: "Concepto de ocurrencia" },
      { id: "task-manager-relations", title: "Relación entre ocurrencias y eventos" },
      { id: "task-manager-list", title: "Vista de lista" },
      { id: "task-manager-list-filters", title: "Filtros en lista" },
      { id: "task-manager-actions", title: "Completar y saltar ocurrencias" },
      { id: "task-manager-backlog", title: "Backlog de ocurrencias" },
      { id: "task-manager-timeline", title: "Vista de timeline" },
    ],
  },
  {
    id: "events",
    title: "Eventos",
    children: [
      { id: "events-eisenhower", title: "Matriz de Eisenhower" },
      { id: "events-calendar", title: "Calendario de eventos" },
    ],
  },
  {
    id: "timeline",
    title: "Línea de Tiempo",
    children: [
      { id: "timeline-nav", title: "Navegación en timeline" },
      { id: "timeline-read", title: "Leer la timeline (filas, columnas)" },
      { id: "timeline-filters", title: "Filtros y agrupaciones" },
      { id: "timeline-info", title: "Información de ocurrencias/eventos" },
    ],
  },
  {
    id: "install",
    title: "Instalar App",
    children: [
      { id: "install-benefits", title: "Ventajas de instalar" },
      { id: "install-steps", title: "Cómo instalar en diferentes dispositivos" },
    ],
  },
]

export default function HelpPage() {
  const [active, setActive] = useState<string | undefined>(undefined)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Centro de ayuda</h1>
          <p className="text-sm text-muted-foreground mt-2">Guías paso a paso, respuestas rápidas y ejemplos interactivos para ayudarte a usar Flex Calendar.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
          <HelpSidebar sections={sections} activeId={active} onSelect={setActive} />

          <main>
            <div className="space-y-4">
              <HelpContent id={active} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
