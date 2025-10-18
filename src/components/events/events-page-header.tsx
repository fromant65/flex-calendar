"use client"

import { Button } from "~/components/ui/button"
import { Grid3x3, Calendar } from "lucide-react"
import { useEventsContext } from "./events-context"

// TODO: Modular component - EventsPageHeader
// Handles the page header with title and mobile view toggle

export function EventsPageHeader() {
  const { mobileView, setMobileView } = useEventsContext()

  return (
    <header className="border-b border-border bg-card flex-shrink-0">
      <div className="px-4 lg:px-6 py-4">
        {/* Layout: 2 rows on <sm, 2 columns on >=sm */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Planificador de Tareas</h1>
            <p className="hidden sm:block text-xs lg:text-sm text-muted-foreground">
              Organiza y programa tus tareas de manera eficiente
            </p>
          </div>

          {/* Mobile view toggle - only visible on screens < lg */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant={mobileView === "matrix" ? "default" : "outline"}
              size="sm"
              onClick={() => setMobileView("matrix")}
              className="cursor-pointer flex-1 sm:flex-none"
            >
              <Grid3x3 className="w-4 h-4 mr-1" />
              Matriz
            </Button>
            <Button
              variant={mobileView === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setMobileView("calendar")}
              className="cursor-pointer flex-1 sm:flex-none"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendario
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
