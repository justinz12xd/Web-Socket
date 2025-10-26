import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones/notificaciones.gateway';
import { WebhookController } from './webhook/webhook.controller';
import { NotificationsModule } from './notificaciones/notificaciones.module';
@Module({
  imports: [NotificationsModule],
  controllers: [WebhookController],
  providers: [],
})
export class AppModule {}
