import { motion } from "framer-motion";
import { LayoutList, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { HelpTip } from "~/components/ui/help-tip";

interface TaskManagerHeaderProps {
  viewMode: "list" | "timeline";
  onViewModeChange: (mode: "list" | "timeline") => void;
}

export function TaskManagerHeader({ viewMode, onViewModeChange }: TaskManagerHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
      <motion.div 
        className="container mx-auto px-4 lg:px-6 py-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Gestor de Ocurrencias</h1>
            <HelpTip title="¿Qué es el Gestor de Ocurrencias?">
              <div className="space-y-2 text-sm">
                <p>
                  El <strong>Gestor de Ocurrencias</strong> es tu panel central para administrar las instancias específicas 
                  de tus tareas recurrentes y únicas.
                </p>
                
                <p className="font-semibold mt-3">¿Qué es una ocurrencia?</p>
                <p>
                  Una ocurrencia es cada instancia individual de una tarea. Por ejemplo, si tienes una tarea 
                  "Hacer ejercicio" que se repite semanalmente, cada semana genera una nueva ocurrencia.
                </p>
                
                <p className="font-semibold mt-3">Vistas disponibles:</p>
                <p>
                  • <strong>Vista Lista</strong>: Organiza las ocurrencias agrupadas por tarea, mostrando 
                  todas las instancias pendientes, en progreso o completadas. Ideal para gestión rápida y acciones directas.
                </p>
                <p>
                  • <strong>Vista Timeline</strong>: Visualización gráfica por fechas, perfecta para planificar 
                  y ver cómo se distribuyen tus ocurrencias a lo largo del tiempo.
                </p>
                
                <p className="font-semibold mt-3">Acciones:</p>
                <p>
                  Desde aquí puedes completar ocurrencias, saltarlas si no las realizaste, editar el tiempo 
                  dedicado, y gestionar el backlog de ocurrencias atrasadas.
                </p>
              </div>
            </HelpTip>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8 gap-1.5 px-2"
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Lista</span>
            </Button>
            <Button
              variant={viewMode === "timeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("timeline")}
              className="h-8 gap-1.5 px-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Timeline</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
