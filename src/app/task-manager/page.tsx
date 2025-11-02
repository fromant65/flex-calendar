"use client";

import { api } from "~/trpc/react";
import { toast } from "sonner"
import { useState, useMemo, useEffect } from "react";
import { AlertCircle, LayoutList, Calendar as CalendarIcon } from "lucide-react";
import type { TaskType } from "~/server/api/services/types";
import { TaskCard } from "~/components/task-manager/task-card";
import { HelpTip } from "~/components/ui/help-tip";
import { ConfirmActionDialog } from "~/components/task-manager/confirm-action-dialog";
import { EditOccurrenceDialog } from "~/components/task-manager/edit-occurrence-dialog";
import { TaskManagerTimeline } from "~/components/task-manager/task-manager-timeline";
import { TaskManagerFilterBar, type TaskManagerFilter } from "~/components/task-manager/task-manager-filter-bar";
import { Button } from "~/components/ui/button";
import type { OccurrenceWithTask } from "~/types";

export default function TaskManagerPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [filters, setFilters] = useState<TaskManagerFilter>({
    searchQuery: "",
    statusFilter: "all",
    taskTypeFilter: "all",
  });
  const [confirmAction, setConfirmAction] = useState<{
    type: "complete" | "skip";
    occurrenceId: number;
    taskName: string;
  } | null>(null);
  const [editingOccurrence, setEditingOccurrence] = useState<{
    id: number;
    timeConsumed: number | null;
    targetDate: Date | null;
    limitDate: Date | null;
  } | null>(null);
  
  // Fetch all occurrences with task details (no filters - get all data)
  const { data: allOccurrences, isLoading, error: occurrencesError } = api.occurrence.getMyOccurrencesWithTask.useQuery()
  
  // Apply filters on the frontend
  const occurrences = useMemo(() => {
    if (!allOccurrences) return [];
    
    return allOccurrences.filter((occ) => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesName = occ.task.name.toLowerCase().includes(searchLower);
        if (!matchesName) return false;
      }
      
      // Status filter
      if (filters.statusFilter !== "all" && occ.status !== filters.statusFilter) {
        return false;
      }
      
      // Task type filter
      if (filters.taskTypeFilter !== "all" && occ.task.taskType !== filters.taskTypeFilter) {
        return false;
      }
      
      return true;
    });
  }, [allOccurrences, filters]);
  
  // Get next occurrence preview for selected task
  const { data: nextOccurrenceDate, error: nextOccurrenceError } = api.task.previewNextOccurrence.useQuery(
    { id: selectedTaskId! },
    { enabled: !!selectedTaskId }
  )

  // Show error toasts for queries
  useEffect(() => {
    if (occurrencesError) {
      toast.error("Error al cargar ocurrencias", { 
        description: occurrencesError.message || "No se pudieron cargar las ocurrencias" 
      })
      console.error("Error fetching occurrences:", occurrencesError)
    }
    if (nextOccurrenceError) {
      toast.error("Error al obtener próxima ocurrencia", { 
        description: nextOccurrenceError.message || "No se pudo obtener la próxima ocurrencia" 
      })
      console.error("Error fetching next occurrence preview:", nextOccurrenceError)
    }
  }, [occurrencesError, nextOccurrenceError])
  
  // Mutations
  const utils = api.useUtils();
  const completeOccurrence = api.occurrence.complete.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
      toast.success("Ocurrencia completada", { description: "La ocurrencia fue marcada como completada" })
    },
    onError: (error) => {
      toast.error("Error al completar ocurrencia", { description: error.message || "No se pudo completar la ocurrencia" })
      console.error("Error completing occurrence:", error)
    }
  });
  
  const skipOccurrence = api.occurrence.skip.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
      toast.info("Ocurrencia saltada", { description: "La ocurrencia fue marcada como saltada" })
    },
    onError: (error) => {
      toast.error("Error al saltar ocurrencia", { description: error.message || "No se pudo saltar la ocurrencia" })
      console.error("Error skipping occurrence:", error)
    }
  });

  const updateOccurrence = api.occurrence.update.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setEditingOccurrence(null);
      toast.success("Ocurrencia actualizada", { description: "Los cambios se guardaron correctamente" })
    },
    onError: (error) => {
      toast.error("Error al actualizar ocurrencia", { description: error.message || "No se pudo actualizar la ocurrencia" })
      console.error("Error updating occurrence:", error)
    }
  });

  const skipBacklog = api.occurrence.skipBacklog.useMutation({
    onSuccess: (result) => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      toast.success("Backlog procesado", { 
        description: `Se saltearon ${result.skippedCount} ocurrencia${result.skippedCount !== 1 ? 's' : ''}` 
      })
    },
    onError: (error) => {
      toast.error("Error al procesar backlog", { description: error.message || "No se pudo procesar el backlog" })
      console.error("Error skipping backlog:", error)
    }
  });

  // Handlers
  const handleConfirmAction = (type: "complete" | "skip", occurrenceId: number) => {
    if (type === "complete") {
      completeOccurrence.mutate({ id: occurrenceId });
    } else {
      skipOccurrence.mutate({ id: occurrenceId });
    }
  };

  const handleSaveOccurrence = (id: number, data: { 
    timeConsumed: number | null;
    targetDate?: Date | null;
    limitDate?: Date | null;
  }) => {
    updateOccurrence.mutate({
      id,
      data: {
        timeConsumed: data.timeConsumed ?? undefined,
        targetDate: data.targetDate === null ? undefined : data.targetDate,
        limitDate: data.limitDate === null ? undefined : data.limitDate,
      },
    });
  };
  
  // Group occurrences by task (filter out inactive tasks)
  // Filtering by search/status/type is done in the frontend for better UX
  const groupedOccurrences = useMemo(() => {
    if (!occurrences) return new Map();
    
    const grouped = new Map<number, typeof occurrences>();
    
    occurrences.forEach((occ) => {
      // Skip inactive tasks
      if (!occ.task.isActive) return;
      
      const taskId = occ.task.id;
      if (!grouped.has(taskId)) {
        grouped.set(taskId, []);
      }
      grouped.get(taskId)!.push(occ);
    });
    
    // Sort occurrences within each task by startDate
    grouped.forEach((occs) => {
      occs.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });
    
    return grouped;
  }, [occurrences]);

  // Calculate total tasks count (before filtering)
  const totalTasksCount = useMemo(() => {
    if (!allOccurrences) return 0;
    const uniqueTaskIds = new Set(
      allOccurrences
        .filter(occ => occ.task.isActive)
        .map(occ => occ.task.id)
    );
    return uniqueTaskIds.size;
  }, [allOccurrences]);

  // Handler for timeline occurrence click
  const handleTimelineOccurrenceClick = (occurrence: OccurrenceWithTask) => {
    setSelectedTaskId(occurrence.task.id);
  };

  // Handler for timeline complete
  const handleTimelineComplete = (occurrenceId: number) => {
    const occurrence = occurrences?.find(o => o.id === occurrenceId);
    if (occurrence) {
      setConfirmAction({
        type: "complete",
        occurrenceId,
        taskName: occurrence.task.name
      });
    }
  };

  // Handler for timeline skip
  const handleTimelineSkip = (occurrenceId: number) => {
    const occurrence = occurrences?.find(o => o.id === occurrenceId);
    if (occurrence) {
      setConfirmAction({
        type: "skip",
        occurrenceId,
        taskName: occurrence.task.name
      });
    }
  };

  // Handler for timeline edit
  const handleTimelineEdit = (occurrence: OccurrenceWithTask) => {
    setEditingOccurrence({
      id: occurrence.id,
      timeConsumed: occurrence.timeConsumed,
      targetDate: occurrence.targetDate,
      limitDate: occurrence.limitDate,
    });
  };
  
  // Only show loading spinner on initial load (when there's no data yet)
  if (isLoading && !occurrences) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // True empty state - no occurrences at all (not just filtered out)
  if (!allOccurrences || allOccurrences.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background">
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 lg:px-6 py-3">
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
                onClick={() => setViewMode("list")}
                className="h-8 gap-1.5 px-2"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Lista</span>
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className="h-8 gap-1.5 px-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Timeline</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Timeline View */}
      {viewMode === "timeline" ? (
        <div className="flex-1 overflow-hidden">
          <TaskManagerTimeline
            occurrences={occurrences ?? []}
            onOccurrenceClick={handleTimelineOccurrenceClick}
            onCompleteOccurrence={handleTimelineComplete}
            onSkipOccurrence={handleTimelineSkip}
            onEditOccurrence={handleTimelineEdit}
          />
        </div>
      ) : (
        /* Content - List View */
        <div className="container mx-auto px-4 lg:px-6 py-6 flex-1 overflow-y-auto">
          {/* Filter Bar - Always visible */}
          <div className="mb-6">
            <TaskManagerFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              totalTasks={totalTasksCount}
              filteredCount={groupedOccurrences.size}
            />
          </div>

          {/* Tasks List */}
          {groupedOccurrences.size === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {Array.from(groupedOccurrences.entries()).map(([taskId, taskOccurrences]) => {
                const task = taskOccurrences[0]!.task;
                const taskType = task.taskType as TaskType;
                const isExpanded = selectedTaskId === taskId;

                return (
                  <TaskCard
                    key={taskId}
                    task={task}
                    taskType={taskType}
                    occurrences={taskOccurrences}
                    isExpanded={isExpanded}
                    nextOccurrenceDate={isExpanded ? nextOccurrenceDate : null}
                    onToggle={() => setSelectedTaskId(isExpanded ? null : taskId)}
                    onEditOccurrence={(id, timeConsumed, targetDate, limitDate) =>
                      setEditingOccurrence({ id, timeConsumed, targetDate, limitDate })
                    }
                    onCompleteOccurrence={(id, taskName) =>
                      setConfirmAction({ type: "complete", occurrenceId: id, taskName })
                    }
                    onSkipOccurrence={(id, taskName) =>
                      setConfirmAction({ type: "skip", occurrenceId: id, taskName })
                    }
                    onSkipBacklog={(taskId) => skipBacklog.mutate({ taskId })}
                    isCompleting={completeOccurrence.isPending}
                    isSkipping={skipOccurrence.isPending}
                    isSkippingBacklog={skipBacklog.isPending}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <ConfirmActionDialog
        action={confirmAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={completeOccurrence.isPending || skipOccurrence.isPending}
      />

      <EditOccurrenceDialog
        occurrence={editingOccurrence}
        onSave={handleSaveOccurrence}
        onCancel={() => setEditingOccurrence(null)}
        isLoading={updateOccurrence.isPending}
      />
    </div>
  );
}
