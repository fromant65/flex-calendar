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
    targetDate: Date | null;
    limitDate: Date | null;
  } | null;
  onSave: (id: number, data: { 
    timeConsumed: number | null;
    targetDate?: Date | null;
    limitDate?: Date | null;
  }) => void;
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
  const [targetDate, setTargetDate] = useState<string>("");
  const [limitDate, setLimitDate] = useState<string>("");

  useEffect(() => {
    if (occurrence) {
      setTimeConsumed(occurrence.timeConsumed);
      
      // Set target date if exists
      if (occurrence.targetDate) {
        const date = new Date(occurrence.targetDate);
        setTargetDate(date.toISOString().split('T')[0] ?? "");
      } else {
        setTargetDate("");
      }
      
      // Set limit date if exists
      if (occurrence.limitDate) {
        const date = new Date(occurrence.limitDate);
        setLimitDate(date.toISOString().split('T')[0] ?? "");
      } else {
        setLimitDate("");
      }
    }
  }, [occurrence]);

  const handleSave = () => {
    if (!occurrence) return;
    
    const data: {
      timeConsumed: number | null;
      targetDate?: Date | null;
      limitDate?: Date | null;
    } = {
      timeConsumed,
    };
    
    // Only include dates if they were changed
    if (targetDate) {
      data.targetDate = new Date(targetDate);
    } else if (targetDate === "" && occurrence.targetDate) {
      // User cleared the date
      data.targetDate = null;
    }
    
    if (limitDate) {
      data.limitDate = new Date(limitDate);
    } else if (limitDate === "" && occurrence.limitDate) {
      // User cleared the date
      data.limitDate = null;
    }
    
    onSave(occurrence.id, data);
  };

  return (
    <Dialog open={!!occurrence} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ocurrencia</DialogTitle>
          <DialogDescription>
            Modifica las horas dedicadas y las fechas de esta ocurrencia.
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
              value={timeConsumed != null ? timeConsumed : ""}
              onChange={(e) =>
                setTimeConsumed(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Ej: 2.5"
            />
            <p className="text-sm text-muted-foreground">
              Este valor representa el tiempo que ya has dedicado a esta ocurrencia.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetDate">Fecha Objetivo</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Fecha ideal para completar esta ocurrencia.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limitDate">Fecha Límite</Label>
            <Input
              id="limitDate"
              type="date"
              value={limitDate}
              onChange={(e) => setLimitDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Fecha máxima para completar esta ocurrencia.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
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
