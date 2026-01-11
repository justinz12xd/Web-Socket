import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Get,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { NotificationsService } from '../notificaciones/notificationes.service';
import {
  AnimalDto,
  PublicacionDto,
  AdopcionDto,
  RefugioDto,
  CampaniaDto,
  CausaUrgenteDto,
  WebhookEventDto,
  EventType,
} from '../common/dto';

/**
 * Verifica la firma HMAC del payload del webhook para garantizar seguridad
 * Solo se ejecuta si la variable de entorno WEBHOOK_SECRET está configurada
 */
function verifySignature(body: any, signature?: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;

  // En desarrollo, permitir sin firma (pero advertir)
  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  return signature === expected;
}

/**
 * WebhookController
 * -----------------
 * Controlador REST que recibe notificaciones HTTP desde el backend (Rust).
 *
 * Flujo:
 * 1. Backend Rust realiza un POST a /webhooks/:entity
 * 2. Este controlador valida la firma HMAC (si está configurada)
 * 3. Procesa el evento y delega a NotificationsService
 * 4. NotificationsService emite el evento via WebSocket a los clientes
 *
 * Endpoints disponibles:
 * - POST /webhooks/animals - Eventos de animales
 * - POST /webhooks/publicaciones - Eventos de publicaciones
 * - POST /webhooks/adopciones - Eventos de adopciones
 * - POST /webhooks/refugios - Eventos de refugios
 * - POST /webhooks/campanias - Eventos de campañas
 * - GET /webhooks/stats - Estadísticas del servidor WebSocket
 */
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly notifications: NotificationsService) {}

  // ============================================================================
  // ENDPOINTS PARA ANIMALES
  // ============================================================================

  @Post('animals')
  @HttpCode(200)
  async handleAnimalEvent(
    @Body() event: WebhookEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    this.validateSignature(event, signature);
    this.logger.log(`📥 Evento recibido: ${event.type}`);

    const animal = event.payload as AnimalDto;

    switch (event.type) {
      case EventType.ANIMAL_CREATED:
        this.notifications.notifyAnimalCreated(animal);
        break;
      case EventType.ANIMAL_UPDATED:
        this.notifications.notifyAnimalUpdated(animal);
        break;
      case EventType.ANIMAL_DELETED:
        this.notifications.notifyAnimalDeleted(animal.id_animal);
        break;
      default:
        throw new BadRequestException(
          `Tipo de evento no válido: ${event.type}`,
        );
    }

    return { success: true, event: event.type };
  }

  // ============================================================================
  // ENDPOINTS PARA PUBLICACIONES
  // ============================================================================

  @Post('publicaciones')
  @HttpCode(200)
  async handlePublicacionEvent(
    @Body() event: WebhookEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    this.validateSignature(event, signature);
    this.logger.log(`📥 Evento recibido: ${event.type}`);

    const publicacion = event.payload as PublicacionDto;

    switch (event.type) {
      case EventType.PUBLICACION_CREATED:
        this.notifications.notifyPublicacionCreated(publicacion);
        break;
      case EventType.PUBLICACION_UPDATED:
        this.notifications.notifyPublicacionUpdated(publicacion);
        break;
      case EventType.PUBLICACION_DELETED:
        this.notifications.notifyPublicacionDeleted(publicacion.id_publicacion);
        break;
      default:
        throw new BadRequestException(
          `Tipo de evento no válido: ${event.type}`,
        );
    }

    return { success: true, event: event.type };
  }

  // ============================================================================
  // ENDPOINTS PARA ADOPCIONES
  // ============================================================================

  @Post('adopciones')
  @HttpCode(200)
  async handleAdopcionEvent(
    @Body() event: WebhookEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    this.validateSignature(event, signature);
    this.logger.log(`📥 Evento recibido: ${event.type}`);

    const adopcion = event.payload as AdopcionDto;

    switch (event.type) {
      case EventType.ADOPCION_CREATED:
        this.notifications.notifyAdopcionCreated(adopcion);
        break;
      case EventType.ADOPCION_UPDATED:
        this.notifications.notifyAdopcionUpdated(adopcion);
        break;
      case EventType.ADOPCION_DELETED:
        this.notifications.notifyAdopcionDeleted(adopcion.id_adopcion);
        break;
      default:
        throw new BadRequestException(
          `Tipo de evento no válido: ${event.type}`,
        );
    }

    return { success: true, event: event.type };
  }

  // ============================================================================
  // ENDPOINTS PARA REFUGIOS
  // ============================================================================

  @Post('refugios')
  @HttpCode(200)
  async handleRefugioEvent(
    @Body() event: WebhookEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    this.validateSignature(event, signature);
    this.logger.log(`📥 Evento recibido: ${event.type}`);

    const refugio = event.payload as RefugioDto;

    switch (event.type) {
      case EventType.REFUGIO_CREATED:
        this.notifications.notifyRefugioCreated(refugio);
        break;
      case EventType.REFUGIO_UPDATED:
        this.notifications.notifyRefugioUpdated(refugio);
        break;
      case EventType.REFUGIO_DELETED:
        this.notifications.notifyRefugioDeleted(refugio.id_refugio);
        break;
      default:
        throw new BadRequestException(
          `Tipo de evento no válido: ${event.type}`,
        );
    }

    return { success: true, event: event.type };
  }

  // ============================================================================
  // ENDPOINTS PARA CAMPAÑAS
  // ============================================================================

  @Post('campanias')
  @HttpCode(200)
  async handleCampaniaEvent(
    @Body() event: WebhookEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    this.validateSignature(event, signature);
    this.logger.log(`📥 Evento recibido: ${event.type}`);

    const campania = event.payload as CampaniaDto;

    switch (event.type) {
      case EventType.CAMPANIA_CREATED:
        this.notifications.notifyCampaniaCreated(campania);
        break;
      case EventType.CAMPANIA_UPDATED:
        this.notifications.notifyCampaniaUpdated(campania);
        break;
      case EventType.CAMPANIA_DELETED:
        this.notifications.notifyCampaniaDeleted(campania.id_campania);
        break;
      default:
        throw new BadRequestException(
          `Tipo de evento no válido: ${event.type}`,
        );
    }

    return { success: true, event: event.type };
  }

  // ============================================================================
  // ENDPOINTS PARA CAUSAS URGENTES
  // ============================================================================

  @Post('causas_urgentes')
  @HttpCode(200)
  async handleCausaUrgenteEvent(
    @Body() event: WebhookEventDto,
    @Headers('x-signature') signature?: string,
  ) {
    this.validateSignature(event, signature);
    this.logger.log(`📥 Evento recibido: ${event.type}`);

    const causaUrgente = event.payload as CausaUrgenteDto;

    switch (event.type) {
      case EventType.CAUSA_URGENTE_CREATED:
        this.notifications.notifyCausaUrgenteCreated(causaUrgente);
        break;
      case EventType.CAUSA_URGENTE_UPDATED:
        this.notifications.notifyCausaUrgenteUpdated(causaUrgente);
        break;
      case EventType.CAUSA_URGENTE_DELETED:
        this.notifications.notifyCausaUrgenteDeleted(causaUrgente.id_causa_urgente);
        break;
      default:
        throw new BadRequestException(
          `Tipo de evento no válido: ${event.type}`,
        );
    }

    return { success: true, event: event.type };
  }

  // ============================================================================
  // ENDPOINTS DE UTILIDAD
  // ============================================================================

  /**
   * Obtiene estadísticas del servidor WebSocket
   * GET /webhooks/stats
   */
  @Get('stats')
  getStats() {
    return this.notifications.getStats();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private validateSignature(body: any, signature?: string) {
    const isValid = verifySignature(body, signature);

    if (!isValid) {
      this.logger.warn('⚠️  Firma HMAC inválida');
      throw new UnauthorizedException('Firma inválida');
    }
  }
}
