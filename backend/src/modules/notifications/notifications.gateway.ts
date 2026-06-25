import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Notification, NotificationRecipientType } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../database/prisma.service';
import { getCorsOrigins } from '../../config/cors.config';

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
  accountType?: 'user' | 'customer';
};

export type SerializedNotification = Omit<Notification, 'createdAt' | 'readAt'> & {
  createdAt: string;
  readAt: string | null;
};

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers?.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return null;
  }

  private roomFor(recipientType: NotificationRecipientType, recipientId: string) {
    return recipientType === NotificationRecipientType.CUSTOMER
      ? `customer:${recipientId}`
      : `user:${recipientId}`;
  }

  private serialize(notification: Notification): SerializedNotification {
    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null,
    };
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = this.jwtService.verify<JwtPayload>(token);

      if (payload.accountType === 'customer') {
        const customer = await this.prisma.customer.findUnique({
          where: { id: payload.sub },
        });
        if (!customer || customer.status !== 'ACTIVE') {
          throw new UnauthorizedException('Invalid customer');
        }
        client.data.accountType = 'customer';
        client.data.userId = customer.id;
      } else {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });
        if (!user || user.status !== 'ACTIVE') {
          throw new UnauthorizedException('Invalid user');
        }
        client.data.accountType = 'user';
        client.data.userId = user.id;
      }

      const room = this.roomFor(
        client.data.accountType === 'customer'
          ? NotificationRecipientType.CUSTOMER
          : NotificationRecipientType.USER,
        client.data.userId as string,
      );
      await client.join(room);
      this.logger.debug(`Client connected: ${client.id} → ${room}`);
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  emitNotification(notification: Notification) {
    const room = this.roomFor(
      notification.recipientType,
      notification.recipientId,
    );
    this.server.to(room).emit('notification', this.serialize(notification));
  }
}
