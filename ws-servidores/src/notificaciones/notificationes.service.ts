import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';

// Tipo de evento que viene de Rust
export interface DomainEvent {
  type: string;          
  payload: any;          
  target?: {
    room?: string;       
  };
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  broadcastEvent(evt: DomainEvent) {
    const eventName = evt.type || 'notification';
    const payload = evt.payload;
    const room = evt.target?.room;

    if (room) {
      this.gateway.emitToRoom(room, eventName, payload);
    } else {
      this.gateway.emitToAll(eventName, payload);
    }
  }
}
