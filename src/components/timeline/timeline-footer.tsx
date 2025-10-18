/**
 * Timeline Footer Component
 * Shows legend and date range indicator
 */

interface TimelineFooterProps {
  currentDate: Date
  daysToShow: number
}

export function TimelineFooter({ currentDate, daysToShow }: TimelineFooterProps) {
  const endDate = new Date(currentDate)
  endDate.setDate(endDate.getDate() + daysToShow - 1)

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Legend - Left aligned */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded flex items-center justify-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
          </div>
          <span className="text-muted-foreground">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded flex items-center justify-center bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
            <span className="text-yellow-600 dark:text-yellow-400 text-xs">−</span>
          </div>
          <span className="text-muted-foreground">Salteado</span>
        </div>
      </div>

      {/* Period Indicator - Right aligned */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        <span className="font-medium text-foreground">
          {currentDate.toLocaleDateString("es-ES", { 
            day: "2-digit", 
            month: "2-digit", 
            year: "2-digit" 
          })}
        </span>
        {" - "}
        <span className="font-medium text-foreground">
          {endDate.toLocaleDateString("es-ES", { 
            day: "2-digit", 
            month: "2-digit", 
            year: "2-digit" 
          })}
        </span>
      </div>
    </div>
  )
}
