# Love4Pets WebSocket (NestJS + Socket.IO)

Guía práctica para crear y conectar el servicio WebSocket con NestJS + Socket.IO, integrarlo con el REST en Rust y exponerlo al frontend (Next.js) como un dashboard interactivo con filtros. Pensado para una arquitectura limpia y escalable.

## 1) Arquitectura resumida

- Microservicio WebSocket independiente (este proyecto `ws-servidores`).
- El servicio REST en Rust envía eventos al WebSocket via un endpoint HTTP (webhook) o vía broker (Redis/Kafka/RabbitMQ).
- El WebSocket re-emite los eventos a clientes usando Socket.IO, organizados por namespace y rooms (p. ej., por shelter o campaign).
- El frontend (Next.js) se conecta al namespace y se une a rooms según filtros visuales.

```
Rust (REST) ──▶ WebSocket (Nest + Socket.IO) ──▶ Next.js (dashboard)
                  ▲           │
                  │           └─ Rooms / Namespaces
                  └── (Opcional) Redis/Kafka como bus
```

## 2) Requisitos

- Node.js 18+ (o LTS actual) y npm (o pnpm).
- Redis opcional para escalado horizontal del WebSocket.
- Opcional: un secreto compartido para firmar webhooks desde el REST.

## 3) Variables de entorno (.env)

Configura un archivo `.env` en `ws-servidores/` con, por ejemplo:

```
PORT=3000
CORS_ORIGIN=http://localhost:3001
REDIS_URL=redis://localhost:6379
WEBHOOK_SECRET=super-secreto-compartido
```

Notas:
- `CORS_ORIGIN` debe ser la URL del frontend.
- `REDIS_URL` es necesario si activas el adapter de Redis para Socket.IO.

## 4) Instalación

PowerShell (Windows, pwsh):

```powershell
# desde WebSocket/ws-servidores
npm install

# dependencias de websockets y escalado (si faltan)
npm i @nestjs/websockets @nestjs/platform-socket.io socket.io

# para escalar con Redis (opcional pero recomendado)
npm i redis @socket.io/redis-adapter
```

Si prefieres pnpm:

```powershell
pnpm install
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm add redis @socket.io/redis-adapter
```

## 5) Estructura recomendada (servidor)

1. Gateway Socket.IO en `src/notificaciones/notificaciones.gateway.ts` (namespace, rooms, métodos de emisión).
2. Webhook HTTP en `src/webhook.controller.ts` para recibir eventos del REST y emitirlos por Socket.IO.
3. Adapter Redis en `src/redis-io.adapter.ts` para escalado horizontal.
4. Configurar `main.ts` para usar el adapter y CORS.

### 5.1 Gateway (ejemplo)

```ts
// src/notificaciones/notificaciones.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'notifications', cors: { origin: process.env.CORS_ORIGIN || '*' } })
export class NotificacionesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('NotificacionesGateway initialized');
  }

  handleConnection(client: Socket) {
    // Validar token si aplica: client.handshake.auth?.token
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  sendToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  sendToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  @SubscribeMessage('joinRoom')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
  }
}
```

### 5.2 Webhook Controller (REST → WS)

```ts
// src/webhook.controller.ts
import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { NotificacionesGateway } from './notificaciones/notificaciones.gateway';

function verifySignature(body: any, signature?: string) {
  if (!process.env.WEBHOOK_SECRET) return false;
  const expected = createHmac('sha256', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
  return signature === expected;
}

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly gateway: NotificacionesGateway) {}

  @Post('notify')
  @HttpCode(200)
  async notify(@Body() body: any, @Headers('x-signature') signature?: string) {
    if (!verifySignature(body, signature)) throw new UnauthorizedException('Invalid signature');

    const eventType = body.type || 'notification';
    const payload = body.payload;
    const room = body?.target?.room; // p. ej.: "shelter:42"
    if (room) this.gateway.sendToRoom(room, eventType, payload);
    else this.gateway.sendToAll(eventType, payload);
    return { ok: true };
  }
}
```

Registra el controller en tu `AppModule`.

### 5.3 Adapter Redis (escala horizontal)

```ts
// src/redis-io.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  async createIOServer(port: number, options?: any) {
    const server = await super.createIOServer(port, options);
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    const pubClient = createClient({ url });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    server.adapter(createAdapter(pubClient, subClient));
    return server;
  }
}
```

### 5.4 `main.ts`

```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*' });
  if (process.env.REDIS_URL) {
    app.useWebSocketAdapter(new RedisIoAdapter(app));
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## 6) Integración con el REST en Rust

- Desde Rust, envía un `POST` a `http://<WS_HOST>:<PORT>/webhooks/notify` con:

```
Headers:
  Content-Type: application/json
  x-signature: <HMAC_SHA256(body, WEBHOOK_SECRET)>

Body (ejemplo):
{
  "type": "urgent_case",
  "payload": { "id": 123, "desc": "perro perdido", "shelterId": 42 },
  "target": { "room": "shelter:42" }
}
```

Esto hará que el WebSocket emita `urgent_case` a todos los clientes en la room `shelter:42`.

## 7) Frontend (Next.js) – conexión y filtros

1. Instala en `frontend/`:

```powershell
cd ../../frontend
pnpm add socket.io-client  # o npm i socket.io-client
```

2. Crea un hook p. ej. `frontend/hooks/useSocket.ts`:

```ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(token?: string, opts?: { shelterId?: number }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WS_URL) return;
    const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (opts?.shelterId) socket.emit('joinRoom', `shelter:${opts.shelterId}`);
    });
    socket.on('disconnect', () => setConnected(false));

    // eventos generales o específicos
    socket.on('notification', (p) => setEvents((e) => [p, ...e]));
    socket.on('urgent_case', (p) => setEvents((e) => [p, ...e]));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, opts?.shelterId]);

  return { socket: socketRef.current, connected, events };
}
```

3. Configura `NEXT_PUBLIC_WS_URL` en `.env.local` del frontend:

```
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

4. Usa el hook en tu dashboard y aplica filtros visuales (client-side). Para reducir tráfico, cambia de room según filtros.

## 8) Ejecutar localmente

```powershell
# 1) Iniciar WebSocket (en esta carpeta)
npm run start:dev

# 2) (Opcional) iniciar Redis si vas a usar el adapter
# docker run -p 6379:6379 redis:7-alpine

# 3) Enviar un evento de prueba desde PowerShell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/webhooks/notify" -Headers @{ 'Content-Type'='application/json'; 'x-signature'='omitida-en-dev' } -Body '{"type":"urgent_case","payload":{"msg":"hola"},"target":{}}'
```

## 9) Seguridad y mejores prácticas

- Autenticar webhooks desde Rust con HMAC (como arriba) o JWT.
- Autenticar clientes Socket.IO con token en el handshake (`auth.token`).
- Restringir CORS a tu dominio del frontend.
- TLS (HTTPS/WSS) en producción.
- Rate limiting para `/webhooks/notify` y límites por socket (flood protection).
- Logs estructurados y métricas (nº de sockets, events/sec). Health checks.

## 10) Escalado y despliegue

- Múltiples instancias detrás de un balanceador + Redis adapter para Socket.IO.
- Opcional: usa Kafka/RabbitMQ si necesitas durabilidad, orden y replay.
- Docker/Kubernetes recomendados. Variables via secrets/configmaps.

## 11) Troubleshooting

- El cliente no recibe eventos: revisa `namespace` (`/notifications`) y rooms.
- CORS bloquea conexión: ajusta `CORS_ORIGIN` y `NEXT_PUBLIC_WS_URL`.
- Escalado horizontal no sincroniza: verifica `REDIS_URL` y conectividad.
- Firma inválida: asegura mismo `WEBHOOK_SECRET` en REST y WebSocket.

---

Si quieres, puedo automatizar estos cambios creando los archivos (`redis-io.adapter.ts`, `webhook.controller.ts`) y ampliando el `gateway` directamente en el repo.
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
