// src/notificaciones/notificaciones.gateway.ts
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

/**
 * NotificationsGateway
 * --------------------
 * WebSocket gateway responsable de la comunicación en tiempo real.
 * - Namespace: /notifications
 * - Usa socket.io (a través de @nestjs/platform-socket.io)
 *
 * API interna (para backend): emitToAll / emitToRoom
 * API pública (para clients): handlers 'joinRoom' y 'leaveRoom'
 *
 * Este gateway es llamado por `NotificationsService` para propagar
 * eventos que vienen desde el controlador REST (webhook).
 */
@WebSocketGateway({ namespace: 'notifications', cors: { origin: process.env.CORS_ORIGIN || '*' } })
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Called when the gateway is initialized by Nest
  afterInit() {
    console.log('[WS] NotificationsGateway initialized');
  }

  // Nuevo cliente conectado al namespace /notifications
  // Aquí se puede validar client.handshake.auth?.token si usas autenticación
  handleConnection(client: Socket) {
    console.log('[WS] Client connected:', client.id);
  }

  // Cliente desconectado
  handleDisconnect(client: Socket) {
    console.log('[WS] Client disconnected:', client.id);
  }

  // ------------------------------------------------------------------
  // API interna (usada por NotificationsService)
  // ------------------------------------------------------------------
  // Emite un evento a todos los clientes conectados en el namespace
  emitToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  // Emite un evento solo a los clientes que están en la "room" especificada
  emitToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  // API pública WebSocket: handlers que el cliente puede invocar
  // - 'joinRoom': unir al socket a una sala específica
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    console.log(`[WS] ${client.id} joined room ${room}`);
  }

  // - 'leaveRoom': salir de una sala
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
    console.log(`[WS] ${client.id} left room ${room}`);
  }
}