import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { NotificationsModule } from './notificaciones/notificaciones.module';
@Module({
  imports: [NotificationsModule],
  controllers: [WebhookController],
  providers: [],
})
export class AppModule {}
