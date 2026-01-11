import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AnimalDto } from './animal.dto';
import { PublicacionDto } from './publicacion.dto';
import { AdopcionDto } from './adopcion.dto';
import { RefugioDto } from './refugio.dto';
import { CampaniaDto } from './campania.dto';
import { CausaUrgenteDto } from './causa-urgente.dto';

/**
 * Tipos de eventos que puede emitir el backend REST
 */
export enum EventType {
  // Eventos de Animal
  ANIMAL_CREATED = 'animal.created',
  ANIMAL_UPDATED = 'animal.updated',
  ANIMAL_DELETED = 'animal.deleted',

  // Eventos de Publicación
  PUBLICACION_CREATED = 'publicacion.created',
  PUBLICACION_UPDATED = 'publicacion.updated',
  PUBLICACION_DELETED = 'publicacion.deleted',

  // Eventos de Adopción
  ADOPCION_CREATED = 'adopcion.created',
  ADOPCION_UPDATED = 'adopcion.updated',
  ADOPCION_DELETED = 'adopcion.deleted',

  // Eventos de Refugio
  REFUGIO_CREATED = 'refugio.created',
  REFUGIO_UPDATED = 'refugio.updated',
  REFUGIO_DELETED = 'refugio.deleted',

  // Eventos de Campaña
  CAMPANIA_CREATED = 'campania.created',
  CAMPANIA_UPDATED = 'campania.updated',
  CAMPANIA_DELETED = 'campania.deleted',

  // Eventos de Causa Urgente
  CAUSA_URGENTE_CREATED = 'causa_urgente.created',
  CAUSA_URGENTE_UPDATED = 'causa_urgente.updated',
  CAUSA_URGENTE_DELETED = 'causa_urgente.deleted',
}

/**
 * DTO para eventos webhook entrantes desde el backend REST
 * El backend Rust enviará eventos HTTP POST con esta estructura
 */
export class WebhookEventDto {
  @IsEnum(EventType)
  type: EventType;

  payload:
    | AnimalDto
    | PublicacionDto
    | AdopcionDto
    | RefugioDto
    | CampaniaDto
    | CausaUrgenteDto
    | any;

  @IsOptional()
  @IsString()
  room?: string;
}
