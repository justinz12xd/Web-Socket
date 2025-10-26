import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notificationes.service';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  afterInit() {
    console.log('[WS] NotificationsGateway initialized');
  }

  handleConnection(client: Socket) {
    // Aquí podrías validar token JWT:
    // const token = client.handshake.auth?.token
    console.log('[WS] Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('[WS] Client disconnected:', client.id);
  }

  // --- API interna: usadas por el service para emitir eventos del dominio ---
  emitToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  emitToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  // --- API pública WebSocket: el frontend puede pedir unirse a rooms ---
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    console.log(`[WS] ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
    console.log(`[WS] ${client.id} left room ${room}`);
  }
}
