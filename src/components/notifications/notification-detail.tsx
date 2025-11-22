"use client";

import { ArrowLeft, CheckCircle, Circle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import type { NotificationWithReadStatus } from "~/server/api/services/types";

interface NotificationDetailProps {
  notification: NotificationWithReadStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function NotificationDetail({
  notification,
  open,
  onOpenChange,
  onClose,
}: NotificationDetailProps) {
  const utils = api.useUtils();

  const markAsUnreadMutation = api.notifications.markAsUnread.useMutation({
    onSuccess: () => {
      void utils.notifications.getForUser.invalidate();
      void utils.notifications.getUnread.invalidate();
      void utils.notifications.getUnreadCount.invalidate();
    },
  });

  const handleMarkAsUnread = () => {
    markAsUnreadMutation.mutate({ notificationId: notification.id });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SheetTitle className="flex-1">{notification.title}</SheetTitle>
          </div>
          <SheetDescription>
            {new Date(notification.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="px-6 py-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap">
                {notification.description}
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          {notification.isRead ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleMarkAsUnread}
              disabled={markAsUnreadMutation.isPending}
            >
              <Circle className="mr-2 h-4 w-4" />
              Marcar como no leída
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Marcada como leída</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
