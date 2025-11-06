import { AlertCircle } from "lucide-react";

interface TaskManagerEmptyStateProps {
  type: "no-occurrences" | "no-results";
}

export function TaskManagerEmptyState({ type }: TaskManagerEmptyStateProps) {
  if (type === "no-occurrences") {
    return (
      <div className="flex flex-col min-h-full bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground">Gestor de Ocurrencias</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona y completa las ocurrencias de tus tareas
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="container mx-auto px-4 lg:px-6 py-8 flex-1">
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">No hay ocurrencias para mostrar</p>
              <p className="text-sm text-muted-foreground">Crea una tarea para comenzar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // no-results state (filtered out)
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">
          No se encontraron tareas
        </p>
        <p className="text-sm text-muted-foreground">
          Intenta ajustar los filtros de búsqueda
        </p>
      </div>
    </div>
  );
}
