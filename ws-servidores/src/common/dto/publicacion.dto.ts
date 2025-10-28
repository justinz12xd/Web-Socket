import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';

export enum EstadoPublicacion {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
  PENDIENTE = 'pendiente',
  RECHAZADA = 'rechazada',
}

/**
 * DTO para la entidad Publicación
 * Representa una publicación en el sistema
 */
export class PublicacionDto {
  @IsNumber()
  id_publicacion: number;

  @IsNumber()
  id_usuario: number;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  fecha_subida?: Date | string;

  @IsOptional()
  @IsEnum(EstadoPublicacion)
  estado?: EstadoPublicacion;

  @IsOptional()
  @IsNumber()
  id_animal?: number;

  @IsOptional()
  @IsString()
  nombre_usuario?: string;

  @IsOptional()
  @IsString()
  nombre_animal?: string;
}
