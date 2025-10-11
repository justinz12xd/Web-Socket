"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdSchema = exports.RefugioSchema = exports.DonacionSchema = exports.AdopcionSchema = exports.PublicacionSchema = exports.AnimalSchema = exports.UsuarioSchema = void 0;
const zod_1 = require("zod");
exports.UsuarioSchema = zod_1.z.object({
    id_usuario: zod_1.z.string().uuid().optional(),
    nombre: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    contrasenia: zod_1.z.string().min(6).optional(),
    telefono: zod_1.z.string().optional(),
    direccion: zod_1.z.string().optional(),
    fecha_registro: zod_1.z.string().optional()
});
exports.AnimalSchema = zod_1.z.object({
    id_animal: zod_1.z.string().uuid().optional(),
    nombre: zod_1.z.string().optional(),
    id_especie: zod_1.z.string().uuid().optional(),
    edad: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    descripcion: zod_1.z.string().optional(),
    fotos: zod_1.z.string().optional(),
    estado_adopcion: zod_1.z.string().optional(),
    id_refugio: zod_1.z.string().uuid().optional()
});
exports.PublicacionSchema = zod_1.z.object({
    id_publicacion: zod_1.z.string().uuid().optional(),
    titulo: zod_1.z.string().min(1).optional(),
    descripcion: zod_1.z.string().optional(),
    fecha_subida: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    id_usuario: zod_1.z.string().uuid().optional(),
    id_animal: zod_1.z.string().uuid().optional()
});
exports.AdopcionSchema = zod_1.z.object({
    id_adopcion: zod_1.z.string().uuid().optional(),
    fecha_adopcion: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    id_publicacion: zod_1.z.string().uuid().optional(),
    id_usuario: zod_1.z.string().uuid().optional()
});
exports.DonacionSchema = zod_1.z.object({
    id_donacion: zod_1.z.string().uuid().optional(),
    monto: zod_1.z.number().optional(),
    fecha: zod_1.z.string().optional(),
    id_usuario: zod_1.z.string().uuid().optional(),
    id_causa_urgente: zod_1.z.string().uuid().optional()
});
exports.RefugioSchema = zod_1.z.object({
    id_refugio: zod_1.z.string().uuid().optional(),
    nombre: zod_1.z.string().optional(),
    direccion: zod_1.z.string().optional(),
    telefono: zod_1.z.string().optional(),
    descripcion: zod_1.z.string().optional()
});
// Generic minimal schema used when not specific
exports.IdSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
