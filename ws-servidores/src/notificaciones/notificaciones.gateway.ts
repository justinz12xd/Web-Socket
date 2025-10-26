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
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

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
  async afterInit() {
  console.log('[WS] Gateway de notificaciones inicializado');

    // Si se proporciona REDIS_URL, configuramos el adapter para scale-out
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();
        await pubClient.connect();
        await subClient.connect();
        // @ts-ignore - socket.io types aceptan adapter
        this.server.adapter(createAdapter(pubClient, subClient));
        console.log('[WS] Adapter Redis configurado para socket.io');
      } catch (err) {
        console.warn('[WS] No se pudo configurar el adapter Redis:', err);
      }
    }
  }

  // Nuevo cliente conectado al namespace /notifications
  // Aquí se puede validar client.handshake.auth?.token si usas autenticación
  handleConnection(client: Socket) {
  console.log('[WS] Cliente conectado:', client.id);
  }

  // Cliente desconectado
  handleDisconnect(client: Socket) {
  console.log('[WS] Cliente desconectado:', client.id);
  }

  // ------------------------------------------------------------------
  // API interna (usada por NotificationsService)
  // ------------------------------------------------------------------
  // Emite un evento a todos los clientes conectados en el namespace
  emitToAll(event: string, payload: any) {
    // Emitir evento específico
    this.server.emit(event, payload);
    // Emitir evento genérico 'notification' con metadatos para frontend
    this.server.emit('notification', { type: event, payload });
  }

  // Emite un evento solo a los clientes que están en la "room" especificada
  emitToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
    this.server.to(room).emit('notification', { type: event, payload, target: { room } });
  }

  // API pública WebSocket: handlers que el cliente puede invocar
  // - 'joinRoom': unir al socket a una sala específica
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
  console.log(`[WS] ${client.id} se unió a la sala ${room}`);
  }

  // - 'leaveRoom': salir de una sala
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
    console.log(`[WS] ${client.id} salió de la sala ${room}`);
  }
}