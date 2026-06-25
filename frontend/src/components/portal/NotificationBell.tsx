'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { notificationsService, type Notification } from '@/services/notifications.service';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { unreadCount, notifications, isLoading, ring, invalidate } = useNotifications(open);

  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    invalidate();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await notificationsService.markAsRead(notification.id);
      invalidate();
    }
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--portal-border)] bg-white/70 text-[var(--portal-muted)] hover:bg-white hover:text-[var(--portal-foreground)] sm:h-9 sm:w-9"
        aria-label="Thông báo"
      >
        <Bell className={cn('h-4 w-4', ring && 'animate-bounce text-[var(--brand-accent)]')} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Thông báo</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Đọc tất cả
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Chưa có thông báo
            </p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/50 transition-colors',
                  !notification.readAt && 'bg-primary/5',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{notification.title}</p>
                  {!notification.readAt && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
