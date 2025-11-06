import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useTaskManagerMutations(
  setConfirmAction: (action: { type: "complete" | "skip"; occurrenceId: number; taskName: string } | null) => void,
  setEditingOccurrence: (occurrence: { id: number; timeConsumed: number | null; targetTimeConsumption: number | null; targetDate: Date | null; limitDate: Date | null } | null) => void
) {
  const utils = api.useUtils();

  const completeOccurrence = api.occurrence.complete.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
      toast.success("Ocurrencia completada", { 
        description: "La ocurrencia fue marcada como completada" 
      });
    },
    onError: (error) => {
      toast.error("Error al completar ocurrencia", { 
        description: error.message || "No se pudo completar la ocurrencia" 
      });
      console.error("Error completing occurrence:", error);
    }
  });
  
  const skipOccurrence = api.occurrence.skip.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
      toast.info("Ocurrencia saltada", { 
        description: "La ocurrencia fue marcada como saltada" 
      });
    },
    onError: (error) => {
      toast.error("Error al saltar ocurrencia", { 
        description: error.message || "No se pudo saltar la ocurrencia" 
      });
      console.error("Error skipping occurrence:", error);
    }
  });

  const updateOccurrence = api.occurrence.update.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setEditingOccurrence(null);
      toast.success("Ocurrencia actualizada", { 
        description: "Los cambios se guardaron correctamente" 
      });
    },
    onError: (error) => {
      toast.error("Error al actualizar ocurrencia", { 
        description: error.message || "No se pudo actualizar la ocurrencia" 
      });
      console.error("Error updating occurrence:", error);
    }
  });

  const skipBacklog = api.occurrence.skipBacklog.useMutation({
    onSuccess: (result) => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      const messages = [];
      if (result.createdCount > 0) {
        messages.push(`${result.createdCount} ocurrencia${result.createdCount !== 1 ? 's' : ''} generada${result.createdCount !== 1 ? 's' : ''}`);
      }
      if (result.skippedCount > 0) {
        messages.push(`${result.skippedCount} ocurrencia${result.skippedCount !== 1 ? 's' : ''} salteada${result.skippedCount !== 1 ? 's' : ''}`);
      }
      const description = messages.length > 0 ? messages.join(', ') : 'No había ocurrencias para procesar';
      toast.success("Backlog procesado", { description });
    },
    onError: (error) => {
      toast.error("Error al procesar backlog", { 
        description: error.message || "No se pudo procesar el backlog" 
      });
      console.error("Error skipping backlog:", error);
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

  const handleSaveOccurrence = (
    id: number, 
    data: { 
      timeConsumed: number | null;
      targetDate?: Date | null;
      limitDate?: Date | null;
    }
  ) => {
    updateOccurrence.mutate({
      id,
      data: {
        timeConsumed: data.timeConsumed ?? undefined,
        targetDate: data.targetDate === null ? undefined : data.targetDate,
        limitDate: data.limitDate === null ? undefined : data.limitDate,
      },
    });
  };

  return {
    completeOccurrence,
    skipOccurrence,
    updateOccurrence,
    skipBacklog,
    handleConfirmAction,
    handleSaveOccurrence,
  };
}
