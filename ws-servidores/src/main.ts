import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log(
    `[BOOT] realtime-service running on http://localhost:${process.env.PORT ?? 4000}`,
  );
}
bootstrap();
