"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { UrgentTasksList } from "~/components/dashboard/urgent-tasks-list"
import { EventsList } from "~/components/dashboard/events-list"
import { Badge } from "~/components/ui/badge"
import { toast } from "sonner"
import { CheckSquare, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import type { CalendarOccurrenceLike, CalendarEventLike } from "~/types/v2-ui"

interface DashboardContentProps {
  id: string
  completedOccurrences: number[]
  setCompletedOccurrences: (ids: number[]) => void
}

export function DashboardContent({ id, completedOccurrences, setCompletedOccurrences }: DashboardContentProps) {
  const urgentOccurrences: CalendarOccurrenceLike[] = []
  const helpEventsV2: CalendarEventLike[] = []

  const handleCompleteTask = (occ: CalendarOccurrenceLike) => {
    setCompletedOccurrences([...completedOccurrences, occ.id])
    toast.success("¡Tarea completada!")
  }

  const handleSkipTask = (_occ: CalendarOccurrenceLike) => {
    toast.info("Tarea saltada")
  }

  switch (id) {
    case "dashboard":
    case "dashboard-overview":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                El Dashboard: Tu Centro de Control
              </CardTitle>
              <CardDescription>
                Una vista general de todo lo importante en tu día
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                El Dashboard es tu punto de partida. Aquí ves rápidamente las tareas y eventos más importantes
                sin tener que navegar entre diferentes secciones.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Tareas Urgentes
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Muestra ocurrencias que estan cerca de llegar a su fecha límite o ya la pasaron.
                    Aparecen ordenadas por nivel de urgencia.
                  </p>
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                    Requieren acción inmediata
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-blue-500" />
                    Tareas Importantes
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Lista de ocurrencias con alta importancia. Te ayuda a priorizar
                    qué hacer primero cuando tienes múltiples tareas pendientes.
                  </p>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    Prioridad alta
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    Eventos
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Muestra todos los eventos programados para hoy y para el resto de la semana con sus horarios.
                    Incluye ademas una vista alternativa de calendario como la de la página de eventos
                  </p>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                    Calendario del día, la semana y el mes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case "dashboard-tasks":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestionar Tareas desde el Dashboard</CardTitle>
              <CardDescription>
                Acciones rápidas sin salir de tu vista principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Desde el Dashboard puedes realizar las acciones más comunes sobre tus tareas urgentes e importantes.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Acciones disponibles</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <strong>Completar:</strong> Marca la ocurrencia como terminada y actualiza las estadísticas
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <strong>Saltar:</strong> Omite la ocurrencia sin afectar negativamente tus estadísticas
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <strong>Ver detalles:</strong> Haz clic en la tarjeta para ver más información
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Ejemplo interactivo: Tareas Urgentes</h4>
                  <div className="border rounded-lg p-4 bg-muted/5">
                    <UrgentTasksList 
                      occurrences={urgentOccurrences}
                      onCompleteTask={handleCompleteTask}
                      onSkipTask={handleSkipTask}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Prueba completar o saltar una tarea para ver cómo funciona
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Ejemplo interactivo: Eventos de Hoy</h4>
                  <div className="border rounded-lg p-4 bg-muted/5">
                    <EventsList events={helpEventsV2.slice(0, 3)} title="Eventos de Hoy" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Los eventos muestran su horario y estado actual
                  </p>
                </div>
              </div>

              <HelpTip title="¿Cuándo usar el Dashboard?">
                Usa el Dashboard como tu rutina matutina: revisa qué tienes pendiente, completa lo urgente,
                y verifica tu calendario del día. Es perfecto para tener una visión general sin perderte en detalles.
              </HelpTip>
            </CardContent>
          </Card>
        </div>
      )

    default:
      return null
  }
}
