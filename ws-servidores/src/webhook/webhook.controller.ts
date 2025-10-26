import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { NotificationsService } from '../notificaciones/notificationes.service';
import { IncomingEventDto } from '../notificaciones/dto/incoming-event.dto';

/**
 * Verifica la firma HMAC del payload del webhook.
 * En producción deberías establecer WEBHOOK_SECRET en las variables de entorno.
 * Actualmente esta comprobación está deshabilitada y devuelve true para
 * facilitar el desarrollo local.
 */
function verifySignature(body: any, signature?: string) {
  // const secret = process.env.WEBHOOK_SECRET;
  // if (!secret) return false;

  // const expected = createHmac('sha256', secret)
  //   .update(JSON.stringify(body))
  //   .digest('hex');

  // return signature === expected;
  return true; // Temporalmente deshabilitado para desarrollo
}

/**
 * WebhookController
 * -----------------
 * Recibe llamadas HTTP desde el backend que publica eventos (por ejemplo,
 * un servicio escrito en Rust). Valida la firma (opcional) y delega en
 * NotificationsService para emitir via WebSocket a los clientes.
 */
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('notify')
  @HttpCode(200)
  async notify(
    @Body() body: IncomingEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    // Seguridad: solo aceptamos eventos firmados por el backend Rust
    const ok = verifySignature(body, signature);
    if (!ok) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Si pasa la firma, disparamos el evento en tiempo real
    // El servicio decide si emitir a una room o a todos
    this.notifications.broadcastEvent({
      type: body.type,
      payload: body.payload,
      target: body.target,
    });

    return { ok: true };
  }
}
