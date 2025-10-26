import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Punto de entrada de la aplicación.
 * - Crea el contexto NestJS
 * - Habilita CORS según la variable de entorno `CORS_ORIGIN`
 * - Escucha en `PORT` (por defecto 4000)
 *
 * Variables de entorno relevantes:
 * - PORT: puerto donde el servidor escucha (default 4000)
 * - CORS_ORIGIN: origen permitido para CORS (default '*')
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir conexiones desde el frontend durante dev
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
  });

  // Intentar enlazar al puerto configurado; si está en uso, probar puertos
  // consecutivos (hasta 10 intentos) para evitar EADDRINUSE en desarrollo.
  const startPort = process.env.PORT ? Number(process.env.PORT) : 4000;
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    try {
      await app.listen(port);
      console.log(`[BOOT] realtime-service running on http://localhost:${port}`);
      return;
    } catch (err: any) {
      // Si el puerto está en uso, intentamos el siguiente
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`[BOOT] port ${port} in use, trying ${port + 1}...`);
        // Si es el último intento, volver a lanzar el error
        if (i === maxAttempts - 1) throw err;
        // esperar un momento antes de reintentar (opcional)
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      // Si es otro error, propagar
      throw err;
    }
  }
}

bootstrap().catch((err) => {
  console.error('[BOOT] Failed to start application:', err);
  process.exit(1);
});
