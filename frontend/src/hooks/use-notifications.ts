'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notificationsService,
  type Notification,
  type NotificationType,
  type NotificationsResponse,
} from '@/services/notifications.service';
import { playNotificationSound, unlockNotificationAudio } from '@/lib/notification-sound';
import { createNotificationSocket } from '@/lib/notification-socket';
import { getToken } from '@/lib/auth';

const SOUND_TYPES: NotificationType[] = [
  'WALLET_REQUEST_APPROVED',
  'WALLET_REQUEST_REJECTED',
];

function unwrap<T>(payload: { data?: T } | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function useNotifications(open: boolean) {
  const queryClient = useQueryClient();
  const [ring, setRing] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const unlock = () => unlockNotificationAudio();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const {
    data: listData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => unwrap(await notificationsService.getAll({ limit: 15 })),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (listData) {
      readyRef.current = true;
    }
  }, [listData]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = createNotificationSocket(token);

    const onNotification = (notification: Notification) => {
      queryClient.setQueryData<NotificationsResponse>(
        ['notifications', 'list'],
        (old) => {
          if (!old) return old;
          if (old.data.some((n) => n.id === notification.id)) return old;
          return {
            ...old,
            data: [notification, ...old.data].slice(0, 15),
            unreadCount: old.unreadCount + 1,
            total: old.total + 1,
          };
        },
      );

      if (readyRef.current && SOUND_TYPES.includes(notification.type)) {
        playNotificationSound();
        setRing(true);
        setTimeout(() => setRing(false), 1200);
      }
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
      socket.disconnect();
    };
  }, [queryClient]);

  useEffect(() => {
    if (open) {
      void refetch();
    }
  }, [open, refetch]);

  const unreadCount = listData?.unreadCount ?? 0;
  const notifications = listData?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return {
    unreadCount,
    notifications,
    isLoading,
    ring,
    refetch,
    invalidate,
  };
}
