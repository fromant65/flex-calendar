"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { PlayCircle, CheckSquare, SkipForward } from "lucide-react"

export function ActionsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Completar y Saltar Ocurrencias
          </CardTitle>
          <CardDescription>
            Cómo gestionar el ciclo de vida de una ocurrencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-600" />
              Completar una ocurrencia
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Marcar como completada indica que finalizaste esa instancia de la tarea.
            </p>
            <div className="space-y-2 text-sm ml-4">
              <p><strong>Qué sucede:</strong></p>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ El estado cambia de Pending a Completed</li>
                <li>✓ Se registra la fecha de completado</li>
                <li>✓ Si tiene evento asociado, el evento también se marca completo</li>
                <li>✓ Las estadísticas de la tarea se actualizan</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <SkipForward className="h-4 w-4 text-gray-600" />
              Saltar una ocurrencia
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Saltar indica que decidiste NO hacer esa ocurrencia. No es lo mismo que fallar.
            </p>
          </div>

          <HelpTip title="Deshacer acciones">
            Si completaste o saltaste una ocurrencia por error, puedes editarla y cambiar su estado de vuelta a Pending.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
