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

  await app.listen(process.env.PORT ?? 4000);
  console.log(
    `[BOOT] realtime-service running on http://localhost:${process.env.PORT ?? 4000}`,
  );
}

bootstrap();
