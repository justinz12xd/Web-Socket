import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';

// Tipo de evento que viene del sistema que publica eventos (ej. backend Rust)
export interface DomainEvent {
  // Nombre del evento que será emitido por socket.io (p. ej. 'order.created')
  type: string;
  // Cualquier payload que acompañe al evento
  payload: any;
  // Opcional: target para rutas más finas (rooms)
  target?: {
    room?: string;
  };
}

/**
 * NotificationsService
 * --------------------
 * Servicio que actúa como puente entre el controlador REST (webhook)
 * y el gateway WebSocket. Recibe eventos del mundo exterior y decide
 * cómo enviarlos a los clientes conectados.
 */
@Injectable()
export class NotificationsService {
  constructor(
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  /**
   * broadcastEvent
   * - evt.type -> nombre del evento socket
   * - evt.payload -> datos a enviar
   * - evt.target?.room -> si está presente, emitir solo a esa room
   */
  broadcastEvent(evt: DomainEvent) {
    const eventName = evt.type || 'notification';
    const payload = evt.payload;
    const room = evt.target?.room;

    if (room) {
      // Emitir solo a la sala (ej. mensajes privados / canales)
      this.gateway.emitToRoom(room, eventName, payload);
    } else {
      // Emitir a todos los clientes conectados
      this.gateway.emitToAll(eventName, payload);
    }
  }
}
