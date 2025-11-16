"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Badge } from "~/components/ui/badge"
import { Filter } from "lucide-react"

export function ListFiltersContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros en Vista de Lista
          </CardTitle>
          <CardDescription>
            Cómo usar los filtros para encontrar ocurrencias específicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Los filtros te permiten reducir la lista a ocurrencias que cumplen ciertos criterios.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Filtrar por estado</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="bg-yellow-500 dark:bg-yellow-600">Pending</Badge>
                <Badge className="bg-green-500 dark:bg-green-600">Completed</Badge>
                <Badge className="bg-gray-500 dark:bg-gray-600">Skipped</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Muestra solo ocurrencias en el estado seleccionado. Útil para revisar solo las pendientes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Filtrar por rango de fechas</h4>
              <div className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>Hoy:</strong> Solo ocurrencias de hoy</li>
                <li>• <strong>Esta semana:</strong> Próximos 7 días</li>
                <li>• <strong>Este mes:</strong> Mes actual</li>
                <li>• <strong>Personalizado:</strong> Define rango específico</li>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Búsqueda por texto</h4>
              <p className="text-sm text-muted-foreground">
                Busca por nombre de la tarea. La búsqueda es instantánea y no distingue mayúsculas.
              </p>
            </div>
          </div>

          <HelpTip title="Combinar filtros">
            Puedes combinar múltiples filtros para búsquedas muy específicas.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
