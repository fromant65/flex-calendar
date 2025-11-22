"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { toast } from "sonner";
import { NotificationCard } from "./notifications/notification-card";
import { CreateNotificationDialog } from "./notifications/create-notification-dialog";
import { EditNotificationDialog } from "./notifications/edit-notification-dialog";
import { DeleteNotificationDialog } from "./notifications/delete-notification-dialog";

interface NotificationForm {
  title: string;
  description: string;
  isActive: boolean;
}

export function NotificationsSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NotificationForm>({
    title: "",
    description: "",
    isActive: true,
  });

  const utils = api.useUtils();

  const { data: notifications = [], isLoading } = api.notifications.getAll.useQuery();

  const createMutation = api.notifications.create.useMutation({
    onSuccess: () => {
      void utils.notifications.getAll.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Notificación creada exitosamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.notifications.update.useMutation({
    onSuccess: () => {
      void utils.notifications.getAll.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("Notificación actualizada exitosamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.notifications.delete.useMutation({
    onSuccess: () => {
      void utils.notifications.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedNotificationId(null);
      toast.success("Notificación eliminada exitosamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleStatusMutation = api.notifications.toggleStatus.useMutation({
    onSuccess: (_, variables) => {
      void utils.notifications.getAll.invalidate();
      toast.success(
        variables.isActive
          ? "Notificación activada exitosamente"
          : "Notificación desactivada exitosamente"
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      isActive: true,
    });
    setSelectedNotificationId(null);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (notificationId: number) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      setFormData({
        title: notification.title,
        description: notification.description,
        isActive: notification.isActive,
      });
      setSelectedNotificationId(notificationId);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdate = () => {
    if (selectedNotificationId) {
      updateMutation.mutate({
        id: selectedNotificationId,
        ...formData,
      });
    }
  };

  const handleDelete = (notificationId: number) => {
    setSelectedNotificationId(notificationId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedNotificationId) {
      deleteMutation.mutate({ id: selectedNotificationId });
    }
  };

  const handleToggleStatus = (notificationId: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({
      id: notificationId,
      isActive: !currentStatus,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestión de Notificaciones</CardTitle>
              <CardDescription>
                Crea y administra notificaciones para todos los usuarios
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Notificación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No hay notificaciones</p>
                <p className="text-sm">Crea tu primera notificación para empezar</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  isToggling={toggleStatusMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateNotificationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onCreate={handleCreate}
        isCreating={createMutation.isPending}
      />

      <EditNotificationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onUpdate={handleUpdate}
        isUpdating={updateMutation.isPending}
      />

      <DeleteNotificationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
