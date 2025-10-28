import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum EstadoAdopcionAnimal {
  DISPONIBLE = 'disponible',
  ADOPTADO = 'adoptado',
  EN_PROCESO = 'en_proceso',
  NO_DISPONIBLE = 'no_disponible',
}

/**
 * DTO para la entidad Animal
 * Representa los datos de un animal en el sistema
 */
export class AnimalDto {
  @IsNumber()
  id_animal: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsNumber()
  edad?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @IsOptional()
  @IsEnum(EstadoAdopcionAnimal)
  estado_adopcion?: EstadoAdopcionAnimal;

  @IsOptional()
  @IsNumber()
  id_especie?: number;

  @IsOptional()
  @IsNumber()
  id_refugio?: number;

  @IsOptional()
  @IsString()
  nombre_especie?: string;

  @IsOptional()
  @IsString()
  nombre_refugio?: string;
}
