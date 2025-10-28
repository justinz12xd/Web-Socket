import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';
import {
  AnimalDto,
  PublicacionDto,
  AdopcionDto,
  RefugioDto,
  CampaniaDto,
  EventType,
} from '../common/dto';

/**
 * NotificationsService
 * --------------------
 * Servicio responsable de manejar la lógica de negocio de las notificaciones.
 * Actúa como puente entre el WebhookController y el NotificationsGateway.
 *
 * Proporciona métodos específicos para cada tipo de entidad, facilitando
 * el mantenimiento y la extensibilidad del código.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  // ============================================================================
  // MÉTODOS PARA ANIMALES
  // ============================================================================

  /**
   * Notifica la creación de un nuevo animal
   */
  notifyAnimalCreated(animal: AnimalDto) {
    this.logger.log(
      `🐾 Nuevo animal creado: ${animal.nombre} (ID: ${animal.id_animal})`,
    );
    this.gateway.emitToAll(EventType.ANIMAL_CREATED, animal);
  }

  /**
   * Notifica la actualización de un animal
   */
  notifyAnimalUpdated(animal: AnimalDto) {
    this.logger.log(
      `🐾 Animal actualizado: ${animal.nombre} (ID: ${animal.id_animal})`,
    );
    this.gateway.emitToAll(EventType.ANIMAL_UPDATED, animal);
  }

  /**
   * Notifica la eliminación de un animal
   */
  notifyAnimalDeleted(animalId: number) {
    this.logger.log(`🐾 Animal eliminado (ID: ${animalId})`);
    this.gateway.emitToAll(EventType.ANIMAL_DELETED, { id_animal: animalId });
  }

  // ============================================================================
  // MÉTODOS PARA PUBLICACIONES
  // ============================================================================

  /**
   * Notifica la creación de una nueva publicación
   */
  notifyPublicacionCreated(publicacion: PublicacionDto) {
    this.logger.log(
      `📝 Nueva publicación: ${publicacion.titulo} (ID: ${publicacion.id_publicacion})`,
    );
    this.gateway.emitToAll(EventType.PUBLICACION_CREATED, publicacion);
  }

  /**
   * Notifica la actualización de una publicación
   */
  notifyPublicacionUpdated(publicacion: PublicacionDto) {
    this.logger.log(
      `📝 Publicación actualizada: ${publicacion.titulo} (ID: ${publicacion.id_publicacion})`,
    );
    this.gateway.emitToAll(EventType.PUBLICACION_UPDATED, publicacion);
  }

  /**
   * Notifica la eliminación de una publicación
   */
  notifyPublicacionDeleted(publicacionId: number) {
    this.logger.log(`📝 Publicación eliminada (ID: ${publicacionId})`);
    this.gateway.emitToAll(EventType.PUBLICACION_DELETED, {
      id_publicacion: publicacionId,
    });
  }

  // ============================================================================
  // MÉTODOS PARA ADOPCIONES
  // ============================================================================

  /**
   * Notifica la creación de una nueva adopción
   */
  notifyAdopcionCreated(adopcion: AdopcionDto) {
    this.logger.log(`🏠 Nueva adopción creada (ID: ${adopcion.id_adopcion})`);
    this.gateway.emitToAll(EventType.ADOPCION_CREATED, adopcion);
  }

  /**
   * Notifica la actualización de una adopción
   */
  notifyAdopcionUpdated(adopcion: AdopcionDto) {
    this.logger.log(`🏠 Adopción actualizada (ID: ${adopcion.id_adopcion})`);
    this.gateway.emitToAll(EventType.ADOPCION_UPDATED, adopcion);
  }

  /**
   * Notifica la eliminación de una adopción
   */
  notifyAdopcionDeleted(adopcionId: number) {
    this.logger.log(`🏠 Adopción eliminada (ID: ${adopcionId})`);
    this.gateway.emitToAll(EventType.ADOPCION_DELETED, {
      id_adopcion: adopcionId,
    });
  }

  // ============================================================================
  // MÉTODOS PARA REFUGIOS
  // ============================================================================

  /**
   * Notifica la creación de un nuevo refugio
   */
  notifyRefugioCreated(refugio: RefugioDto) {
    this.logger.log(
      `🏛️ Nuevo refugio: ${refugio.nombre} (ID: ${refugio.id_refugio})`,
    );
    this.gateway.emitToAll(EventType.REFUGIO_CREATED, refugio);
  }

  /**
   * Notifica la actualización de un refugio
   */
  notifyRefugioUpdated(refugio: RefugioDto) {
    this.logger.log(
      `🏛️ Refugio actualizado: ${refugio.nombre} (ID: ${refugio.id_refugio})`,
    );
    this.gateway.emitToAll(EventType.REFUGIO_UPDATED, refugio);
  }

  /**
   * Notifica la eliminación de un refugio
   */
  notifyRefugioDeleted(refugioId: number) {
    this.logger.log(`🏛️ Refugio eliminado (ID: ${refugioId})`);
    this.gateway.emitToAll(EventType.REFUGIO_DELETED, {
      id_refugio: refugioId,
    });
  }

  // ============================================================================
  // MÉTODOS PARA CAMPAÑAS
  // ============================================================================

  /**
   * Notifica la creación de una nueva campaña
   */
  notifyCampaniaCreated(campania: CampaniaDto) {
    this.logger.log(
      `📢 Nueva campaña: ${campania.titulo} (ID: ${campania.id_campania})`,
    );
    this.gateway.emitToAll(EventType.CAMPANIA_CREATED, campania);
  }

  /**
   * Notifica la actualización de una campaña
   */
  notifyCampaniaUpdated(campania: CampaniaDto) {
    this.logger.log(
      `📢 Campaña actualizada: ${campania.titulo} (ID: ${campania.id_campania})`,
    );
    this.gateway.emitToAll(EventType.CAMPANIA_UPDATED, campania);
  }

  /**
   * Notifica la eliminación de una campaña
   */
  notifyCampaniaDeleted(campaniaId: number) {
    this.logger.log(`📢 Campaña eliminada (ID: ${campaniaId})`);
    this.gateway.emitToAll(EventType.CAMPANIA_DELETED, {
      id_campania: campaniaId,
    });
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  /**
   * Obtiene estadísticas del servidor WebSocket
   */
  getStats() {
    return {
      connectedClients: this.gateway.getConnectedClientsCount(),
      timestamp: new Date().toISOString(),
    };
  }
}
