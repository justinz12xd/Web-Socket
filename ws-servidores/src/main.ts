import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execCb);

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
  console.log(`[BOOT] servicio en tiempo real escuchando en http://localhost:${port}`);
      return;
    } catch (err: any) {
      // Si el puerto está en uso, intentar diagnosticar / limpiar según configuración
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`[BOOT] puerto ${port} en uso.`);

        // Si se solicita, intentar identificar y matar el proceso que usa el puerto.
        // Variable de entorno opcional: KILL_OCCUPYING_PORT=1
        const shouldKill = process.env.KILL_OCCUPYING_PORT === '1';
        if (shouldKill) {
          try {
            const platform = process.platform;
            let pid: string | undefined;

            if (platform === 'win32') {
              // netstat -ano | findstr :<port>
              const { stdout } = await exec(`netstat -ano | findstr ":${port}"`);
              // stdout lines contain PID at the end
              const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
              if (lines.length > 0) {
                const parts = lines[0].trim().split(/\s+/);
                pid = parts[parts.length - 1];
              }
              if (pid) {
                console.log(`[BOOT] Matando proceso ${pid} que ocupa el puerto ${port} (Windows)...`);
                await exec(`taskkill /PID ${pid} /F`);
              }
            } else {
              // unix-like: use lsof to find pid
              try {
                const { stdout } = await exec(`lsof -t -i :${port}`);
                pid = stdout.trim().split(/\r?\n/)[0];
              } catch (e) {
                // lsof may not be available, try ss as fallback
                try {
                  const { stdout } = await exec(`ss -ltnp 'sport = :${port}'`);
                  const m = stdout.match(/pid=(\d+),/);
                  if (m) pid = m[1];
                } catch (e2) {
                  // ignore
                }
              }

              if (pid) {
                console.log(`[BOOT] Matando proceso ${pid} que ocupa el puerto ${port} (unix)...`);
                await exec(`kill -9 ${pid}`);
              }
            }

            // Esperar un instante y reintentar
            await new Promise((r) => setTimeout(r, 250));
            // Reintentar este mismo puerto inmediatamente
            i = i - 1; // decrement so loop will try same port again
            continue;
          } catch (killErr) {
            console.warn('[BOOT] No se pudo matar el proceso que ocupaba el puerto:', killErr);
            // If it's the last attempt, throw
            if (i === maxAttempts - 1) throw err;
            await new Promise((r) => setTimeout(r, 200));
            continue;
          }
        } else {
          console.warn(`[BOOT] puerto ${port} en uso, intentando ${port + 1}... (establece KILL_OCCUPYING_PORT=1 para intentar liberarlo)`);
          // Si es el último intento, volver a lanzar el error
          if (i === maxAttempts - 1) throw err;
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
      }
      // Si es otro error, propagar
      throw err;
    }
  }
}

bootstrap().catch((err) => {
  console.error('[BOOT] Error al iniciar la aplicación:', err);
  process.exit(1);
});
