"use client";

import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { data: unreadCount } = api.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative h-9 w-9 transition-all hover:scale-110 cursor-pointer"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {unreadCount !== undefined && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
