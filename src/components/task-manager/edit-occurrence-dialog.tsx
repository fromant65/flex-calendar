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
import { normalizeDateForDisplay } from "~/lib/date-display-utils";

interface EditOccurrenceDialogProps {
  occurrence: {
    id: number;
    timeConsumed: number | null;
    targetTimeConsumption: number | null;
    targetDate: Date | null;
    limitDate: Date | null;
  } | null;
  onSave: (id: number, data: { 
    timeConsumed: number | null;
    targetTimeConsumption?: number | null;
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
  const [targetTimeConsumption, setTargetTimeConsumption] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");
  const [limitDate, setLimitDate] = useState<string>("");

  useEffect(() => {
    if (occurrence) {
      setTimeConsumed(occurrence.timeConsumed);
      setTargetTimeConsumption(occurrence.targetTimeConsumption);
      
      // Set target date if exists - use normalized date to avoid timezone issues
      if (occurrence.targetDate) {
        const normalized = normalizeDateForDisplay(occurrence.targetDate);
        if (normalized) {
          const year = normalized.getFullYear();
          const month = String(normalized.getMonth() + 1).padStart(2, '0');
          const day = String(normalized.getDate()).padStart(2, '0');
          setTargetDate(`${year}-${month}-${day}`);
        } else {
          setTargetDate("");
        }
      } else {
        setTargetDate("");
      }
      
      // Set limit date if exists - use normalized date to avoid timezone issues
      if (occurrence.limitDate) {
        const normalized = normalizeDateForDisplay(occurrence.limitDate);
        if (normalized) {
          const year = normalized.getFullYear();
          const month = String(normalized.getMonth() + 1).padStart(2, '0');
          const day = String(normalized.getDate()).padStart(2, '0');
          setLimitDate(`${year}-${month}-${day}`);
        } else {
          setLimitDate("");
        }
      } else {
        setLimitDate("");
      }
    }
  }, [occurrence]);

  const handleSave = () => {
    if (!occurrence) return;
    
    const data: {
      timeConsumed: number | null;
      targetTimeConsumption?: number | null;
      targetDate?: Date | null;
      limitDate?: Date | null;
    } = {
      timeConsumed,
      targetTimeConsumption,
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <Dialog open={!!occurrence} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent 
        className="sm:max-w-md"
        onCloseAutoFocus={(e) => {
          // Prevent focus from returning to the dropdown trigger
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Editar Ocurrencia</DialogTitle>
          <DialogDescription>
            Modifica el tiempo objetivo, las horas dedicadas y las fechas de esta ocurrencia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="targetTimeConsumption">Tiempo Objetivo (horas)</Label>
            <Input
              id="targetTimeConsumption"
              type="number"
              step="0.5"
              min="0"
              value={targetTimeConsumption != null ? targetTimeConsumption : ""}
              onChange={(e) =>
                setTargetTimeConsumption(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Ej: 3"
            />
            <p className="text-sm text-muted-foreground">
              Cantidad de horas que esperas dedicar a esta ocurrencia.
            </p>
          </div>

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
