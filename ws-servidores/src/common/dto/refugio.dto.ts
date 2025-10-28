import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * DTO para la entidad Refugio
 * Representa un refugio de animales en el sistema
 */
export class RefugioDto {
  @IsNumber()
  id_refugio: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  total_animales?: number;

  @IsOptional()
  @IsNumber()
  capacidad_maxima?: number;
}
