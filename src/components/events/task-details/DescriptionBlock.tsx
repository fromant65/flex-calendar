"use client"

export function DescriptionBlock({ description }: { description?: string | null }) {
  if (!description) return null
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Descripción</h4>
      <p className="text-sm text-foreground leading-relaxed">{description}</p>
    </div>
  )
}

export default DescriptionBlock
