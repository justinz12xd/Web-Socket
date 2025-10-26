/**
 * IncomingEventDto
 * -----------------
 * DTO que define el contrato esperado para los webhooks entrantes.
 * El emisor (por ejemplo, el backend en Rust) deberá enviar un JSON con
 * esta forma para que el servicio lo procese y lo reenvíe por WebSocket.
 *
 * Propiedades:
 * - type: nombre del evento que será emitido por socket.io (p. ej. "order.created")
 * - payload: cualquier JSON con los datos del evento
 * - target.room: (opcional) room a la que se dirigirá el evento
 */
export class IncomingEventDto {
  /** Nombre del evento a emitir. Ej: "urgent_case" o "adoption.created" */
  type!: string;

  /** Payload del evento. Puede ser cualquier estructura JSON. */
  payload!: any;

  /**
   * Opcional: destino del evento. Si se proporciona `room`, el evento se emitirá
   * solo a la sala indicada. Ej: { room: "shelter:42" }
   */
  target?: {
    room?: string;
  };
}
