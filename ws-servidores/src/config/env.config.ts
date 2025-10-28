/**
 * env.config.ts
 * -------------
 * Configuración centralizada de variables de entorno
 * Proporciona valores por defecto y conversión de tipos
 */

export const env = {
  /** Puerto en el que escuchará el servidor WebSocket */
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,

  /** Origen permitido para CORS. En producción, especifica el dominio exacto */
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  /**
   * Secreto para verificar firmas HMAC de webhooks.
   * Si no se configura, se aceptarán webhooks sin verificar (solo para desarrollo)
   */
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || undefined,

  /**
   * Si está activado, intentará matar procesos que ocupen el puerto
   * Solo para desarrollo local
   */
  KILL_OCCUPYING_PORT: process.env.KILL_OCCUPYING_PORT === '1',

  /** Nivel de logging (desarrollo/producción) */
  NODE_ENV: process.env.NODE_ENV || 'development',
};
