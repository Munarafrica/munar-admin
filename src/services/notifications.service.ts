import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { MutationResponse, NotificationRecipient } from '../types/api';
import { delay } from './mock/data';

class NotificationsService {
  async getInbox(status?: string): Promise<NotificationRecipient[]> {
    if (config.features.useMockData) {
      await delay(250);
      return [
        {
          id: 'recipient-1',
          notificationId: 'notification-1',
          userId: 'user-1',
          email: 'demo@example.com',
          phone: null,
          status: 'SENT',
          notification: {
            id: 'notification-1',
            tenantId: 'tenant-1',
            eventId: 'evt-1',
            channel: 'IN_APP',
            templateKey: 'ticket_order_confirmed_paid',
            payloadJson: {
              title: 'Ticket payment confirmed',
              body: 'Your ticket order has been confirmed successfully.',
            },
            status: 'SENT',
            scheduledFor: null,
            sentAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        },
      ];
    }

    return apiClient.get<NotificationRecipient[]>(`/notifications/me`, {
      params: status ? { status } : undefined,
    });
  }

  async markRead(recipientId: string): Promise<MutationResponse<NotificationRecipient>> {
    if (config.features.useMockData) {
      await delay(200);
      return { success: true, message: 'Notification marked as read' };
    }

    const recipient = await apiClient.patch<NotificationRecipient>(`/notifications/${recipientId}/read`);
    return {
      success: true,
      message: 'Notification marked as read',
      data: recipient,
    };
  }
}

export const notificationsService = new NotificationsService();
