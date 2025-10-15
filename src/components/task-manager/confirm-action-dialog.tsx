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

interface ConfirmActionDialogProps {
  action: {
    type: "complete" | "skip";
    occurrenceId: number;
    taskName: string;
  } | null;
  onConfirm: (type: "complete" | "skip", occurrenceId: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmActionDialog({
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={!!action} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action?.type === "complete" ? "Completar ocurrencia" : "Saltar ocurrencia"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action?.type === "complete" ? (
              <>
                ¿Estás seguro de que deseas completar esta ocurrencia de <strong>{action?.taskName}</strong>?
                {" "}Esto generará la siguiente ocurrencia si la tarea es recurrente y eliminará todos los eventos asociados.
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas saltar esta ocurrencia de <strong>{action?.taskName}</strong>?
                {" "}La ocurrencia será marcada como omitida, se generará la siguiente si la tarea es recurrente, y se eliminarán todos los eventos asociados.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              if (action) {
                onConfirm(action.type, action.occurrenceId);
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
