"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { NotificationDetail } from "./notification-detail";
import type { NotificationWithReadStatus } from "~/server/api/services/types";

interface NotificationMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationMenu({ open, onOpenChange }: NotificationMenuProps) {
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationWithReadStatus | null>(null);

  const utils = api.useUtils();

  const { data: allNotifications = [], isLoading: isLoadingAll } =
    api.notifications.getForUser.useQuery(undefined, {
      enabled: open,
    });

  const { data: unreadNotifications = [], isLoading: isLoadingUnread } =
    api.notifications.getUnread.useQuery(undefined, {
      enabled: open,
    });

  const markAsReadMutation = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      void utils.notifications.getForUser.invalidate();
      void utils.notifications.getUnread.invalidate();
      void utils.notifications.getUnreadCount.invalidate();
    },
  });

  const handleNotificationClick = (notification: NotificationWithReadStatus) => {
    setSelectedNotification(notification);

    // Mark as read if it's unread
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }
  };

  const handleCloseDetail = () => {
    setSelectedNotification(null);
  };

  if (selectedNotification) {
    return (
      <NotificationDetail
        notification={selectedNotification}
        open={open}
        onOpenChange={onOpenChange}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Notificaciones</SheetTitle>
          <SheetDescription>
            Mantente al día con las últimas actualizaciones
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mx-6" style={{ width: "calc(100% - 3rem)" }}>
            <TabsTrigger value="new">
              Nuevas ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todas ({allNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="px-6 py-4 space-y-2">
                {isLoadingAll ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </div>
                ) : allNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay notificaciones
                  </div>
                ) : (
                  allNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors hover:bg-accent cursor-pointer ${
                        notification.isRead
                          ? "bg-background"
                          : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-medium text-sm ${
                            notification.isRead ? "text-foreground" : "text-primary"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="px-6 py-4 space-y-2">
                {isLoadingUnread ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay notificaciones nuevas
                  </div>
                ) : (
                  unreadNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full text-left p-4 rounded-lg border bg-primary/5 border-primary/20 transition-colors hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm text-primary">
                          {notification.title}
                        </h3>
                        <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
