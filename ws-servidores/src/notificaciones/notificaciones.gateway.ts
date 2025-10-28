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
import { Logger } from '@nestjs/common';

/**
 * NotificationsGateway
 * --------------------
 * Gateway WebSocket para comunicación en tiempo real con clientes.
 *
 * Flujo de trabajo:
 * 1. Backend REST (Rust) -> POST /webhooks/:entity -> WebhookController
 * 2. WebhookController -> NotificationsService
 * 3. NotificationsService -> NotificationsGateway (este archivo)
 * 4. Gateway emite eventos -> Clientes conectados (Dashboard Frontend)
 *
 * Namespace: /notifications
 * Puerto: Heredado del servidor principal (default 4000)
 *
 * Eventos disponibles para clientes:
 * - animal.created, animal.updated, animal.deleted
 * - publicacion.created, publicacion.updated, publicacion.deleted
 * - adopcion.created, adopcion.updated, adopcion.deleted
 * - refugio.created, refugio.updated, refugio.deleted
 * - campania.created, campania.updated, campania.deleted
 */
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = 0;

  /**
   * Hook ejecutado cuando el gateway es inicializado por NestJS
   */
  afterInit() {
    this.logger.log('🚀 Gateway de notificaciones inicializado');
    this.logger.log(`📡 Namespace: /notifications`);
    this.logger.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  }

  /**
   * Hook ejecutado cuando un nuevo cliente se conecta
   * Aquí puedes implementar autenticación mediante tokens:
   * const token = client.handshake.auth?.token;
   */
  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(
      `✅ Cliente conectado: ${client.id} (Total: ${this.connectedClients})`,
    );

    // Enviar mensaje de bienvenida al cliente
    client.emit('connection-success', {
      message: 'Conectado al servidor WebSocket',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Hook ejecutado cuando un cliente se desconecta
   */
  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(
      `❌ Cliente desconectado: ${client.id} (Total: ${this.connectedClients})`,
    );
  }

  /**
   * Emite un evento a todos los clientes conectados
   * @param event Nombre del evento (ej: 'animal.created')
   * @param payload Datos del evento
   */
  emitToAll(event: string, payload: any) {
    this.logger.debug(`📤 Emitiendo evento "${event}" a todos los clientes`);
    this.server.emit(event, payload);
  }

  /**
   * Emite un evento solo a los clientes en una sala específica
   * @param room Nombre de la sala
   * @param event Nombre del evento
   * @param payload Datos del evento
   */
  emitToRoom(room: string, event: string, payload: any) {
    this.logger.debug(`📤 Emitiendo evento "${event}" a la sala "${room}"`);
    this.server.to(room).emit(event, payload);
  }

  /**
   * Handler para que los clientes se unan a una sala específica
   * Útil para filtrar notificaciones por refugio, campaña, etc.
   *
   * Ejemplo desde el cliente:
   * socket.emit('joinRoom', 'refugio:123');
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    this.logger.log(`👥 Cliente ${client.id} se unió a la sala "${room}"`);
    client.emit('joined-room', { room, timestamp: new Date().toISOString() });
  }

  /**
   * Handler para que los clientes abandonen una sala
   *
   * Ejemplo desde el cliente:
   * socket.emit('leaveRoom', 'refugio:123');
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
    this.logger.log(`👋 Cliente ${client.id} salió de la sala "${room}"`);
    client.emit('left-room', { room, timestamp: new Date().toISOString() });
  }

  /**
   * Handler de ping/pong para verificar la conexión
   * El cliente puede enviar 'ping' y recibirá 'pong'
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Obtiene el número de clientes conectados actualmente
   */
  getConnectedClientsCount(): number {
    return this.connectedClients;
  }
}
