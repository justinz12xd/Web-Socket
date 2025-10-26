import { Module } from "@nestjs/common";
import { NotificationsService } from "./notificationes.service";
import { NotificationsGateway } from "./notificaciones.gateway";

/**
 * NotificationsModule
 * -------------------
 * Encapsula el gateway y el servicio de notificaciones para que puedan
 * ser importados por AppModule u otros módulos. Exporta NotificationsService
 * para que controladores (ej. WebhookController) puedan inyectarlo.
 */
@Module({
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}