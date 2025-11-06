import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ConfirmActionDialogProps {
  action: {
    type: "complete" | "skip";
    occurrenceId: number;
    taskName: string;
  } | null;
  onConfirm: (type: "complete" | "skip", occurrenceId: number, timeConsumed?: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmActionDialog({
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmActionDialogProps) {
  const [timeConsumed, setTimeConsumed] = useState<string>("");

  // Reset time consumed when dialog opens/closes
  useEffect(() => {
    if (action) {
      setTimeConsumed("");
    }
  }, [action]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <AlertDialog open={!!action} onOpenChange={handleOpenChange}>
      <AlertDialogContent onCloseAutoFocus={(e) => {
        // Prevent focus from returning to the dropdown trigger
        e.preventDefault();
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action?.type === "complete" ? "Completar ocurrencia" : "Saltar ocurrencia"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action?.type === "complete" ? (
              <>
                ¿Estás seguro de que deseas completar esta ocurrencia de <strong>{action?.taskName}</strong>?
                {" "}Esto generará la siguiente ocurrencia si la tarea es recurrente y marcará todos los eventos asociados como completados.
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas saltar esta ocurrencia de <strong>{action?.taskName}</strong>?
                {" "}La ocurrencia será marcada como omitida, se generará la siguiente si la tarea es recurrente, y se eliminarán todos los eventos asociados.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Show time consumed input only when completing */}
        {action?.type === "complete" && (
          <div className="space-y-2">
            <Label htmlFor="timeConsumed">
              Tiempo dedicado (horas) <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input
              id="timeConsumed"
              type="number"
              min="0"
              step="0.25"
              value={timeConsumed}
              onChange={(e) => setTimeConsumed(e.target.value)}
              placeholder="Ej: 2.5"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Indica cuántas horas dedicaste a esta tarea
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            className="cursor-pointer"
            onClick={() => {
              if (action) {
                const time = timeConsumed && !isNaN(parseFloat(timeConsumed)) 
                  ? parseFloat(timeConsumed) 
                  : undefined;
                onConfirm(action.type, action.occurrenceId, time);
              }
            }}
          >
            {action?.type === "complete" ? "Completar" : "Saltar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
