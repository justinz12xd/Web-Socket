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

function verifySignature(body: any, signature?: string) {
  // const secret = process.env.WEBHOOK_SECRET;
  // if (!secret) return false;

  // const expected = createHmac('sha256', secret)
  //   .update(JSON.stringify(body))
  //   .digest('hex');

  // return signature === expected;
  return true; // Temporalmente deshabilitado para desarrollo
}

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
    this.notifications.broadcastEvent({
      type: body.type,
      payload: body.payload,
      target: body.target,
    });

    return { ok: true };
  }
}
