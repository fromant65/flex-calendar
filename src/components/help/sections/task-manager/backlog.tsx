"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { AlertCircle } from "lucide-react"

export function BacklogContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Backlog de Ocurrencias
          </CardTitle>
          <CardDescription>
            Qué hacer cuando acumulas ocurrencias pendientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-semibold mb-2 text-red-800 dark:text-red-300">¿Qué es el backlog?</h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              El backlog es la acumulación de ocurrencias pendientes que no completaste a tiempo.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Cómo resolver el backlog</h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted/20 rounded-lg border">
                <p className="font-medium text-sm mb-1">1. Saltar lo obsoleto</p>
                <p className="text-sm text-muted-foreground">
                  Revisa ocurrencias antiguas y salta las que ya no tienen sentido completar.
                </p>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg border">
                <p className="font-medium text-sm mb-1">2. Ajustar recurrencia</p>
                <p className="text-sm text-muted-foreground">
                  Si una tarea es diaria pero solo haces 3/semana, cámbiala a Hábito+ con días específicos.
                </p>
              </div>
            </div>
          </div>

          <HelpTip title="Alerta de backlog">
            Flex Calendar te mostrará una alerta si detecta que tienes más de 10 ocurrencias vencidas.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
