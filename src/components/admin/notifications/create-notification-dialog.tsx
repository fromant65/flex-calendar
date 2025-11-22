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

interface CreateNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NotificationForm;
  onFormChange: (data: NotificationForm) => void;
  onCreate: () => void;
  isCreating: boolean;
}

export function CreateNotificationDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onCreate,
  isCreating,
}: CreateNotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Notificación</DialogTitle>
          <DialogDescription>
            Completa los campos para crear una nueva notificación para todos los usuarios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título de la notificación"
              value={formData.title}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción detallada de la notificación"
              rows={4}
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              className="resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormChange({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Activar inmediatamente</Label>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={!formData.title || !formData.description || isCreating}
            className="w-full sm:w-auto"
          >
            {isCreating ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
