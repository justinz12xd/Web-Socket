import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { NotificationsModule } from './notificaciones/notificaciones.module';

/**
 * AppModule
 * ---------
 * Módulo raíz de la aplicación. Importa el módulo de notificaciones
 * y registra el controlador webhook que recibe eventos externos.
 */
@Module({
  imports: [NotificationsModule],
  controllers: [WebhookController],
  providers: [],
})
export class AppModule {}
