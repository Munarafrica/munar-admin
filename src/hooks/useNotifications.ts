import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationsService } from '../services';
import { NotificationRecipient } from '../types/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await notificationsService.getInbox();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = useCallback(async (recipientId: string) => {
    try {
      await notificationsService.markRead(recipientId);
      setNotifications((current) => current.filter((item) => item.id !== recipientId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    reload: loadNotifications,
    markRead,
  };
}
