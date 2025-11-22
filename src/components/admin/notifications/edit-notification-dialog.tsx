"use client";

import { Button } from "~/components/ui/button";
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
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";

interface NotificationForm {
  title: string;
  description: string;
  isActive: boolean;
}

interface EditNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NotificationForm;
  onFormChange: (data: NotificationForm) => void;
  onUpdate: () => void;
  isUpdating: boolean;
}

export function EditNotificationDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onUpdate,
  isUpdating,
}: EditNotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Notificación</DialogTitle>
          <DialogDescription>
            Modifica los campos de la notificación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              placeholder="Título de la notificación"
              value={formData.title}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              placeholder="Descripción detallada de la notificación"
              rows={4}
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              className="resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormChange({ ...formData, isActive: checked })}
            />
            <Label htmlFor="edit-isActive">Notificación activa</Label>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            onClick={onUpdate}
            disabled={!formData.title || !formData.description || isUpdating}
            className="w-full sm:w-auto"
          >
            {isUpdating ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
