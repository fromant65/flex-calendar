"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { List } from "lucide-react"

export function ListContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Vista de Lista
          </CardTitle>
          <CardDescription>
            Visualiza todas las ocurrencias en formato de lista
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            La vista de lista muestra todas tus ocurrencias organizadas de forma lineal, con información detallada de cada una.
          </p>

          <div>
            <h4 className="font-semibold mb-3">Qué ves en cada tarjeta de ocurrencia</h4>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Nombre de la tarea:</strong> Título de la tarea padre</li>
              <li>• <strong>Fecha límite:</strong> Cuándo debe completarse</li>
              <li>• <strong>Estado:</strong> Badge de color (Pending, Completed, Skipped)</li>
              <li>• <strong>Importancia:</strong> Valor de 1 a 10</li>
              <li>• <strong>Eventos asociados:</strong> Si tiene evento programado, muestra el horario</li>
              <li>• <strong>Acciones:</strong> Botones para completar, saltar, editar, eliminar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Orden de las ocurrencias</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Por defecto, las ocurrencias se ordenan por:
            </p>
            <ol className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>1. <strong>Estado:</strong> Pending primero, luego Completed y Skipped</li>
              <li>2. <strong>Fecha límite:</strong> Más próximas primero</li>
              <li>3. <strong>Importancia:</strong> Más importantes primero en caso de empate</li>
            </ol>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm">
              <strong>💡 Tip de productividad:</strong> Usa la vista de lista cuando quieras procesar 
              ocurrencias rápidamente en batch. Puedes marcar varias como completadas seguidas sin cambiar de vista.
            </p>
          </div>

          <HelpTip title="Vista de lista vs Timeline">
            La <strong>lista</strong> es mejor para procesar ocurrencias rápidamente.
            El <strong>timeline</strong> es mejor para visualizar patrones y progreso temporal.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
