import { z } from 'zod';

export const UsuarioSchema = z.object({
  id_usuario: z.string().uuid().optional(),
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contrasenia: z.string().min(6).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_registro: z.string().optional()
});

export const AnimalSchema = z.object({
  id_animal: z.string().uuid().optional(),
  nombre: z.string().optional(),
  id_especie: z.string().uuid().optional(),
  edad: z.string().optional(),
  estado: z.string().optional(),
  descripcion: z.string().optional(),
  fotos: z.string().optional(),
  estado_adopcion: z.string().optional(),
  id_refugio: z.string().uuid().optional()
});

export const PublicacionSchema = z.object({
  id_publicacion: z.string().uuid().optional(),
  titulo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  fecha_subida: z.string().optional(),
  estado: z.string().optional(),
  id_usuario: z.string().uuid().optional(),
  id_animal: z.string().uuid().optional()
});

export const AdopcionSchema = z.object({
  id_adopcion: z.string().uuid().optional(),
  fecha_adopcion: z.string().optional(),
  estado: z.string().optional(),
  id_publicacion: z.string().uuid().optional(),
  id_usuario: z.string().uuid().optional()
});

export const DonacionSchema = z.object({
  id_donacion: z.string().uuid().optional(),
  monto: z.number().optional(),
  fecha: z.string().optional(),
  id_usuario: z.string().uuid().optional(),
  id_causa_urgente: z.string().uuid().optional()
});

export const RefugioSchema = z.object({
  id_refugio: z.string().uuid().optional(),
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional()
});

// Generic minimal schema used when not specific
export const IdSchema = z.object({ id: z.string().uuid() });
