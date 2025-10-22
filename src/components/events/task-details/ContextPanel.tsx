"use client"

export function ContextPanel({ context }: { context?: string | null }) {
  if (!context) return null

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <h4 className="text-sm font-semibold text-foreground mb-1">Contexto</h4>
      <p className="text-sm text-foreground leading-relaxed break-words">{context}</p>
    </div>
  )
}

export default ContextPanel
