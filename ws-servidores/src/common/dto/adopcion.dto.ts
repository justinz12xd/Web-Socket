import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum EstadoAdopcion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
}

/**
 * DTO para la entidad Adopción
 * Representa una solicitud de adopción en el sistema
 */
export class AdopcionDto {
  @IsNumber()
  id_adopcion: number;

  @IsNumber()
  id_publicacion: number;

  @IsNumber()
  id_usuario: number;

  @IsOptional()
  fecha_adopcion?: Date | string;

  @IsOptional()
  @IsEnum(EstadoAdopcion)
  estado?: EstadoAdopcion;

  @IsOptional()
  @IsString()
  nombre_usuario?: string;

  @IsOptional()
  @IsString()
  titulo_publicacion?: string;

  @IsOptional()
  @IsNumber()
  id_animal?: number;

  @IsOptional()
  @IsString()
  nombre_animal?: string;
}
