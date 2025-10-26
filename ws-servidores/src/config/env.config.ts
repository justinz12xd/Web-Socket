/**
 * env.config.ts
 * -------------
 * Archivo de ejemplo para centralizar la lectura de variables de entorno.
 * Aquí puedes definir un objeto con las variables que tu aplicación usa y
 * convertir tipos, poner valores por defecto, etc.
 *
 * Este archivo está vacío por defecto en el repo. Añadelo si quieres usar
 * un lugar centralizado para las configuraciones.
 */

export const env = {
	PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
	CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
	WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || undefined,
	REDIS_URL: process.env.REDIS_URL || undefined,
};

// Ejemplo de uso:
// import { env } from './config/env.config';
// console.log('PORT', env.PORT);
