"use client";

import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { Notification } from "~/server/api/services/types";

interface NotificationCardProps {
  notification: Notification;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  isToggling: boolean;
}

export function NotificationCard({
  notification,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
}: NotificationCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4">
      <div className="flex-1 space-y-1 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{notification.title}</h3>
          <Badge variant={notification.isActive ? "default" : "secondary"}>
            {notification.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Creada el{" "}
          {new Date(notification.createdAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="flex sm:flex-col items-center justify-end gap-2 w-full sm:w-auto">
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(notification.id, notification.isActive)}
            disabled={isToggling}
            className="h-9 w-9"
          >
            {notification.isActive ? (
              <PowerOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground text-center">
            {notification.isActive ? "Desactivar" : "Activar"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(notification.id)}
            className="h-9 w-9"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Editar</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(notification.id)}
            className="h-9 w-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Eliminar</span>
        </div>
      </div>
    </div>
  );
}
