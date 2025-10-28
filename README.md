# 🔌 Servidor WebSocket - Love4Pets

Servidor WebSocket con **NestJS** y **Socket.IO** que actúa como puente en tiempo real entre el backend REST (Rust) y el frontend (Dashboard).

## 🎯 Descripción

Este servidor permite que el backend REST notifique cambios en tiempo real a todos los clientes conectados sin necesidad de polling o refrescos manuales.

### Arquitectura

```
Backend REST (Rust) ──HTTP POST──> Servidor WebSocket ──Socket.IO──> Frontend (Dashboard)
```

**Flujo de comunicación:**
1. El backend REST (Rust) detecta un cambio (creación, actualización o eliminación de datos)
2. Envía un HTTP POST al servidor WebSocket
3. El servidor WebSocket emite el evento via Socket.IO a todos los clientes conectados
4. El frontend (Dashboard) recibe y procesa el evento en tiempo real

## ✨ Características

- ✅ **5 Entidades soportadas**: animales, publicaciones, adopciones, refugios, campañas
- ✅ **Validación de DTOs** con class-validator
- ✅ **Rooms y Namespaces** para organizar eventos
- ✅ **Autenticación HMAC** para webhooks
- ✅ **TypeScript** end-to-end
- ✅ **Scripts de prueba** incluidos

## 📋 Requisitos

- Node.js 18+ (LTS)
- npm o pnpm
- Backend REST en Rust (opcional para pruebas locales)

## 📦 Instalación

```bash
cd ws-servidores
npm install
```

## ⚙️ Configuración

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variables de entorno:

```env
# Puerto del servidor WebSocket
PORT=4000

# Origen permitido para CORS (URL del frontend)
CORS_ORIGIN=http://localhost:3000

# Secreto para firmas HMAC (compartido con el backend REST)
WEBHOOK_SECRET=tu-secreto-super-seguro
```

## 🚀 Uso

### Desarrollo

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:4000`

### Producción

```bash
npm run build
npm run start:prod
```

## 📡 API REST (Webhooks)

El backend REST debe enviar eventos HTTP POST a estos endpoints:

| Entidad        | Endpoint                   | Eventos                                    |
|----------------|----------------------------|--------------------------------------------|
| Animales       | `/webhooks/animals`        | `animal.created`, `animal.updated`, `animal.deleted` |
| Publicaciones  | `/webhooks/publicaciones`  | `publicacion.created`, `publicacion.updated`, `publicacion.deleted` |
| Adopciones     | `/webhooks/adopciones`     | `adopcion.created`, `adopcion.updated`, `adopcion.deleted` |
| Refugios       | `/webhooks/refugios`       | `refugio.created`, `refugio.updated`, `refugio.deleted` |
| Campañas       | `/webhooks/campanias`      | `campania.created`, `campania.updated`, `campania.deleted` |
| Estadísticas   | `/webhooks/stats` (GET)    | Estadísticas del servidor |

### Formato del Evento

```json
{
  "type": "animal.created",
  "payload": {
    "id_animal": 123,
    "nombre": "Luna",
    "edad": 2,
    "estado_adopcion": "disponible"
  }
}
```

## 🌐 Conexión desde el Frontend

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000/notifications');

socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket');
});

socket.on('animal.created', (data) => {
  console.log('Nuevo animal:', data);
});

socket.on('publicacion.updated', (data) => {
  console.log('Publicación actualizada:', data);
});
```

## 🧪 Scripts de Prueba

### Cliente WebSocket de prueba

```bash
node scripts/test-client.js
```

Este script se conecta al servidor y escucha todos los eventos.

### Enviar webhooks de prueba

```bash
# Crear un animal
node scripts/send-webhook.js animal created

# Actualizar una publicación
node scripts/send-webhook.js publicacion updated

# Eliminar una adopción
node scripts/send-webhook.js adopcion deleted
```

## 🏗️ Estructura del Proyecto

```
ws-servidores/
├── src/
│   ├── common/dto/              # DTOs tipados para todas las entidades
│   ├── config/                  # Configuración (variables de entorno)
│   ├── notificaciones/          # Gateway y servicio WebSocket
│   ├── webhook/                 # Controlador REST para recibir webhooks
│   ├── app.module.ts
│   └── main.ts
├── scripts/
│   ├── test-client.js           # Cliente de prueba
│   └── send-webhook.js          # Enviar webhooks de prueba
└── package.json
```

## 📚 Documentación Completa

Para documentación detallada sobre integración con Rust y Frontend, consulta:

- 📖 [Guía de Integración con Rust](../GUIA_INTEGRACION_RUST.md)
- 📖 [Guía de Dashboard Frontend](../GUIA_DASHBOARD_FRONTEND.md)
- 📖 [Documentación Completa](../DOCUMENTACION.md)

## 🔒 Seguridad

- ✅ Autenticación HMAC en webhooks (header `x-signature`)
- ✅ CORS configurado para el origen del frontend
- ✅ Validación de DTOs con class-validator
- ⚠️ En producción: usa HTTPS/WSS y tokens de autenticación

## 🤝 Contribuir

Este es un proyecto privado de **Love4Pets**. Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

## 📝 Licencia

UNLICENSED - Proyecto privado Love4Pets

---

**Construido con ❤️ usando NestJS y Socket.IO**
