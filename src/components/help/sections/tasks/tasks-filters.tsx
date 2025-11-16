"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Search } from "lucide-react"

export function TasksFilters() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Tareas
          </CardTitle>
          <CardDescription>
            Cómo usar los filtros para encontrar tareas específicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            La página de tareas incluye una barra de filtros que te permite buscar y filtrar tareas por múltiples criterios.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Filtrar por tipo de tarea</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">Única</Badge>
                <Badge variant="outline">Recurrente finita</Badge>
                <Badge variant="outline">Hábito</Badge>
                <Badge variant="outline">Hábito+</Badge>
                <Badge variant="outline">Única fija</Badge>
                <Badge variant="outline">Fija repetitiva+</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Filtra por tipo para ver solo tareas únicas, recurrentes, hábitos, etc.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Filtrar por estado</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">Activas</Badge>
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">Inactivas</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Las tareas inactivas no generan nuevas ocurrencias, pero mantienen su historial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Filtrar por horario</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">Con horario fijo</Badge>
                <Badge variant="outline">Sin horario fijo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Las tareas con horario fijo tienen tiempo de inicio y fin predefinido.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Búsqueda por texto</h4>
              <p className="text-sm text-muted-foreground">
                Busca por nombre o descripción de la tarea. La búsqueda es instantánea y no distingue mayúsculas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Ordenar tareas</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <strong>Por importancia:</strong> Tareas más importantes primero</li>
                <li>• <strong>Por fecha de creación:</strong> Más recientes primero</li>
                <li>• <strong>Por nombre:</strong> Orden alfabético</li>
              </ul>
            </div>
          </div>

          <HelpTip title="Caso de uso: Revisar hábitos activos">
            Para ver solo tus hábitos activos: selecciona los tipos "Hábito" o "Hábito+" y el estado "Activas".
            Esto te permite revisar y ajustar tus rutinas sin distracciones.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
