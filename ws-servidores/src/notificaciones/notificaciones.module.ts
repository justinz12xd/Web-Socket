import { Module } from "@nestjs/common";
import { NotificationsService } from "./notificationes.service";
import { NotificationsGateway } from "./notificaciones.gateway";

@Module({
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}