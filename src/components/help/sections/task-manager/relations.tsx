"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Repeat, List, Calendar } from "lucide-react"

export function RelationsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Relación entre Ocurrencias y Eventos
          </CardTitle>
          <CardDescription>
            Cómo se conectan las ocurrencias con los eventos en el calendario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Las <strong>ocurrencias</strong> y los <strong>eventos</strong> están relacionados pero son diferentes.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <List className="h-4 w-4" />
                Ocurrencia
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Instancia de una tarea para una fecha</li>
                <li>• NO tiene hora fija (a menos que la tarea lo especifique)</li>
                <li>• Aparece en el Gestor de Tareas</li>
                <li>• Puede NO tener evento asociado</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Evento
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bloque de tiempo específico en tu calendario</li>
                <li>• SIEMPRE tiene hora de inicio y fin</li>
                <li>• Aparece en el Calendario y en Eventos (Eisenhower)</li>
                <li>• Está vinculado a UNA ocurrencia</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Flujo: De tarea a evento</h4>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">1</span>
                <div>
                  <strong>Crear tarea:</strong> "Estudiar React" (Hábito+, diario)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">2</span>
                <div>
                  <strong>Sistema genera ocurrencias:</strong> Una para hoy, otra para mañana, etc.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">3</span>
                <div>
                  <strong>Crear evento desde ocurrencia:</strong> En la Matriz de Eisenhower, arrastras la ocurrencia y creas un evento de 10:00 a 11:30
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">4</span>
                <div>
                  <strong>Evento en calendario:</strong> Ahora esa ocurrencia tiene un evento programado que bloquea ese tiempo
                </div>
              </li>
            </ol>
          </div>

          <HelpTip title="¿Cuándo crear eventos?">
            No todas las ocurrencias necesitan un evento. Crea eventos para ocurrencias que requieren 
            un bloque de tiempo específico en tu día. Por ejemplo, "Ir al gimnasio" puede necesitar 
            un evento de 18:00 a 19:30, pero "Tomar vitaminas" no requiere horario específico.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
