"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { Edit, Copy } from "lucide-react"

export function TasksEdit() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar y Duplicar Tareas
          </CardTitle>
          <CardDescription>
            Cómo modificar tareas existentes o crear copias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar tareas
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Puedes editar cualquier aspecto de una tarea desde la tarjeta de tarea en la página de Tareas.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Cambiar nombre y descripción:</strong> Haz clic en el botón de editar de la tarjeta</li>
              <li>• <strong>Ajustar importancia:</strong> Modifica el valor de 1 a 10</li>
            </ul>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-semibold mb-1 text-yellow-800 dark:text-yellow-300">⚠️ Importante sobre ediciones</p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-200 space-y-1">
                <li>• Solo puedes editar <strong>nombre, descripción e importancia</strong></li>
                <li>• <strong>No puedes editar:</strong> tipo de tarea, horarios fijos ni recurrencias</li>
                <li>• Si necesitas cambiar horarios o recurrencias, debes duplicar la tarea y crear una nueva</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Duplicar tareas
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Duplicar es útil para crear tareas similares sin empezar desde cero.
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>1. Haz clic en "Duplicar" en la tarjeta de tarea</li>
              <li>2. Se abre el formulario de creación con los datos pre-llenados</li>
              <li>3. Modifica lo que necesites (nombre, fechas, etc.)</li>
              <li>4. Guarda para crear la nueva tarea</li>
            </ol>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm">
                <strong>💡 Caso de uso:</strong> Tienes la tarea "Ir al gimnasio" los Lun-Mie-Vie.
                Al duplicarla puedes crear "Clases de natación" con el mismo horario y días, solo cambiando el nombre.
              </p>
            </div>
          </div>

          <HelpTip title="Editar vs Duplicar">
            <strong>Edita</strong> cuando quieras modificar la tarea existente.
            <strong>Duplica</strong> cuando quieras mantener la original y crear una variante.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
