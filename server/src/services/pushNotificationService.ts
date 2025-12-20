import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import User from '../models/User.js';

export class PushNotificationService {
    private static expo = new Expo();

    /**
     * Send push notifications to a user
     */
    static async sendToUser(userId: string, title: string, body: string, data?: any): Promise<void> {
        try {
            const user = await User.findById(userId);
            if (!user || !user.pushTokens || user.pushTokens.length === 0) {
                console.warn(`No push tokens found for user ${userId}`);
                return;
            }

            await this.sendToTokens(user.pushTokens, title, body, data);
        } catch (error) {
            console.error('Error sending push notification to user:', error);
        }
    }

    /**
     * Send push notifications to a list of tokens
     */
    static async sendToTokens(tokens: string[], title: string, body: string, data?: any): Promise<void> {
        const messages: ExpoPushMessage[] = [];

        // Filter valid tokens
        const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

        for (const token of validTokens) {
            messages.push({
                to: token,
                sound: 'default',
                title,
                body,
                data,
            });
        }

        if (messages.length === 0) {
            return;
        }

        const chunks = this.expo.chunkPushNotifications(messages);
        const tickets: ExpoPushTicket[] = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending push notification chunk:', error);
            }
        }

        // Handle receipt errors (removing invalid tokens could be done here)
        // For now, we just log errors
        this.handleTickets(tickets, validTokens);
    }

    private static handleTickets(tickets: ExpoPushTicket[], tokens: string[]) {
        tickets.forEach((ticket, index) => {
            if (ticket.status === 'error') {
                console.error(`Error sending notification to ${tokens[index]}:`, ticket.message);
                if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
                    // TODO: Remove invalid token from user
                    console.log('Token invalid, should remove:', tokens[index]);
                }
            }
        });
    }
}
