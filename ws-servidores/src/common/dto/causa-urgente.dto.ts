import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  IsUUID,
} from 'class-validator';

/**
 * DTO para la entidad CausaUrgente
 * Representa los datos de una causa urgente en el sistema
 */
export class CausaUrgenteDto {
  @IsUUID()
  id_causa_urgente: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  meta?: number;

  @IsOptional()
  @IsNumber()
  recaudado?: number;

  @IsOptional()
  @IsDateString()
  fecha_limite?: string;

  @IsOptional()
  @IsUUID()
  id_refugio?: string;

  @IsOptional()
  @IsUUID()
  id_animal?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @IsOptional()
  @IsString()
  nombre_refugio?: string;

  @IsOptional()
  @IsString()
  nombre_animal?: string;
}
