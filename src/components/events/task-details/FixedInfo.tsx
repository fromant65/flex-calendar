"use client"

import { Lock } from "lucide-react"

export function FixedInfo() {
  return (
    <div className="border-t border-border pt-4">
      <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
        <div className="flex items-start gap-2.5">
          <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">
            Los eventos de tareas fijas no se pueden eliminar. Usa "Skip" si no lo realizaste o "Complete" cuando lo termines.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FixedInfo
