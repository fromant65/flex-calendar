"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"
import { DashboardContent } from "./sections/dashboard-content"
import { TasksContent } from "./sections/tasks-content"
import { TaskManagerContent } from "./sections/task-manager-content"
import { EventsTimelineInstallContent } from "./sections/events-timeline-install-content"
import { TimelineContent } from "./sections/timeline-content"
import { InstallContent } from "./sections/install-content"
import {
  Target,
  CheckSquare,
  Calendar,
  Grid3x3,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import { mockHelpStats } from "~/lib/mock-help-data"

interface HelpContentProps {
  id?: string
}

export function HelpContent({ id }: HelpContentProps) {
  // Interactive state for examples
  const [completedOccurrences, setCompletedOccurrences] = React.useState<number[]>([])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Bienvenido al Centro de Ayuda de Flex Calendar
            </CardTitle>
            <CardDescription>
              Explora guías completas, aprende con ejemplos interactivos y domina todas las funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Flex Calendar es tu sistema completo de gestión de tareas y tiempo. Esta guía te ayudará a:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Entender cómo funcionan las tareas, ocurrencias y eventos</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Crear y gestionar diferentes tipos de tareas (únicas, recurrentes, hábitos)</span>
              </li>
              <li className="flex items-start gap-2">
                <Grid3x3 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Usar la matriz de Eisenhower para priorizar</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Visualizar tu progreso en la línea de tiempo</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-background/50 rounded-lg border">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Selecciona una sección en el menú lateral para ver contenido detallado y ejemplos interactivos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Route to modular components
  if (id.startsWith("dashboard")) {
    return (
      <DashboardContent 
        id={id}
        completedOccurrences={completedOccurrences}
        setCompletedOccurrences={setCompletedOccurrences}
      />
    )
  }

  if (id.startsWith("tasks")) {
    return <TasksContent id={id} />
  }

  if (id.startsWith("task-manager")) {
    return <TaskManagerContent id={id} />
  }

  if (id.startsWith("events")) {
    return <EventsTimelineInstallContent id={id} />
  }

  if (id.startsWith("timeline") || id === "timeline") {
    return <TimelineContent id={id} />
  }

  if (id.startsWith("install") || id === "install") {
    return <InstallContent id={id} />
  }

  // Default fallback for undefined sections
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sección: {id}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Contenido en desarrollo para la sección <strong>{id}</strong>.
        </p>
        <div className="p-4 bg-muted/20 rounded-lg border">
          <p className="text-xs text-muted-foreground">
            💡 Esta sección estará disponible próximamente con guías detalladas y ejemplos interactivos.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

