
# ⚡ Servidor WebSocket - Love4Pets

Este servicio proporciona notificaciones en tiempo real y una API HTTP ligera para las entidades del sistema Love4Pets. Está implementado en TypeScript usando Express + Socket.IO. El objetivo es facilitar notificaciones, chat y eventos en vivo relacionados con usuarios, publicaciones, animales, adopciones y donaciones.

## 📑 Índice

- Descripción y propósito
- Instalación
- Ejecución (desarrollo / producción)
- Endpoints HTTP
- Eventos Socket.IO
- Persistencia y fallback
- Notas de despliegue y mantenimiento

## 📌 Descripción

- Acepta conexiones Socket.IO y permite que los clientes se unan a "salas" con `socket.emit('join', <roomId>)`.
- Expone rutas CRUD bajo `/api/{entidad}` (por ejemplo `/api/usuario`, `/api/animal`).
- Emite eventos en tiempo real cuando una entidad es creada/actualizada/eliminada. Los eventos siguen el patrón `{entidad}_{accion}` (p. ej. `usuario_created`).
- Valida entradas con `zod` (si se tiene el esquema) y persiste en SQLite cuando la dependencia nativa está disponible.

## ☸️ Instalación

Desde la carpeta `WebSocket` (PowerShell):

```powershell
npm install
```

Nota: `better-sqlite3` es una dependencia nativa. En Windows puede requerir Visual Studio Build Tools y Python para compilar. Si no deseas instalar herramientas de compilación, el servicio funciona con un almacenamiento en memoria (fallback) sin `better-sqlite3`.

## ▶️ Ejecución

Desarrollo (rápido, usa ts-node):

```powershell
npm run dev
```

Compilar y ejecutar (producción básica):

```powershell
npm run build
npm start
```

El servidor por defecto escucha en el puerto 4000 (puedes cambiarlo con la variable `PORT`).

## 🔗 Endpoints HTTP principales

Las rutas siguen el patrón `/api/{entidad}` y `/api/{entidad}/:id`.

- POST /api/usuario
- GET /api/usuario
- GET /api/usuario/:id
- PUT /api/usuario/:id
- DELETE /api/usuario/:id

También están disponibles las mismas rutas para: `animal`, `publicacion`, `adopcion`, `donacion`, `refugio`.

Endpoint de utilidad para pruebas (emite eventos arbitrarios):

- POST /emit  — cuerpo: `{ "event": "nombre_evento", "data": {...}, "room": "optionalRoomId" }`

## ⚡ Eventos Socket.IO

Cuando ocurre una operación CRUD, el servidor emite eventos con estos nombres:

- `{entidad}_created`
- `{entidad}_updated`
- `{entidad}_deleted`

Ejemplos: `publicacion_created`, `donacion_updated`.

Además, si el payload contiene campos como `id_usuario`, `id_refugio` o `id_animal`, el servidor también emite el mismo evento en la "sala" correspondiente a ese id (útil para notificaciones privadas dirigidas a un usuario/refugio específico).

Clientes recomendados: cualquier cliente Socket.IO (JS, mobile). Ejemplo mínimo de conexión:

```js
const io = require('socket.io-client');
const socket = io('http://localhost:4000');
socket.emit('join', 'id_usuario_123');
socket.on('usuario_created', (payload) => console.log('Usuario creado', payload));
```

## 🗄️ Persistencia y fallback

- Intentamos usar `better-sqlite3` para persistencia en disco (archivo `data/love4pets.sqlite`).
- Si `better-sqlite3` no está disponible (fallo al instalar el módulo nativo), el servicio cae a un almacenamiento en memoria que permite seguir desarrollando y probando sin errores.

Notas importantes:
- El fallback en memoria no es persistente entre reinicios.
- Para producción se recomienda usar una base de datos persistente y robusta (Postgres, Supabase, etc.) y/o arreglar la instalación de `better-sqlite3` instalando las herramientas de compilación en Windows.

## 🔧 Notas de despliegue y mantenimiento

- Añadir autenticación/autorización para endpoints HTTP y sockets (p. ej. JWT).
- Implementar una capa de repositorio y migraciones para la base de datos.
- Considerar un adaptador Redis para Socket.IO si se escala a múltiples instancias.
- Añadir logs estructurados y monitorización (Prometheus, Sentry).

## 📝 Mantenimiento

Al modificar el servicio:

1. Mantén la consistencia en los nombres de eventos y rutas.
2. Actualiza los esquemas Zod en `src/validation.ts` cuando cambies entidades.
3. Añade tests para endpoints y lógica de eventos.
4. Documenta cambios en este README.

---






