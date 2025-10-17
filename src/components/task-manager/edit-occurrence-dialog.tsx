import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

interface EditOccurrenceDialogProps {
  occurrence: {
    id: number;
    timeConsumed: number | null;
  } | null;
  onSave: (id: number, timeConsumed: number | null) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditOccurrenceDialog({
  occurrence,
  onSave,
  onCancel,
  isLoading = false,
}: EditOccurrenceDialogProps) {
  const [timeConsumed, setTimeConsumed] = useState<number | null>(null);

  useEffect(() => {
    if (occurrence) {
      setTimeConsumed(occurrence.timeConsumed);
    }
  }, [occurrence]);

  return (
    <Dialog open={!!occurrence} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ocurrencia</DialogTitle>
          <DialogDescription>
            Modifica las horas dedicadas a esta ocurrencia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="timeConsumed">Horas dedicadas</Label>
            <Input
              id="timeConsumed"
              type="number"
              step="0.5"
              min="0"
              value={timeConsumed ?? ""}
              onChange={(e) =>
                setTimeConsumed(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Ej: 2.5"
            />
            <p className="text-sm text-muted-foreground">
              Este valor representa el tiempo que ya has dedicado a esta ocurrencia.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (occurrence) {
                onSave(occurrence.id, timeConsumed);
              }
            }}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
