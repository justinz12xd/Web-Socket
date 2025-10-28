import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum EstadoCampania {
  PLANIFICADA = 'planificada',
  ACTIVA = 'activa',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

/**
 * DTO para la entidad Campaña
 * Representa una campaña de voluntariado o concienciación
 */
export class CampaniaDto {
  @IsNumber()
  id_campania: number;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  fecha_inicio?: Date | string;

  @IsOptional()
  fecha_fin?: Date | string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  organizador?: string;

  @IsOptional()
  @IsEnum(EstadoCampania)
  estado?: EstadoCampania;

  @IsOptional()
  @IsNumber()
  id_tipo_campania?: number;

  @IsOptional()
  @IsString()
  nombre_tipo_campania?: string;

  @IsOptional()
  @IsNumber()
  total_voluntarios?: number;
}
