/**// Script que envía un POST al webhook de la app

 * Script para enviar webhooks de prueba al servidor// Uso: node scripts/send-webhook.js

 * Simula el backend REST en Rust enviando eventos// Requisitos: npm i axios

 * 

 * Uso:const axios = require('axios');

 * node scripts/send-webhook.js <entidad> <accion>

 * const SERVER = process.env.SERVER || 'http://localhost:4000';

 * Ejemplos:const URL = `${SERVER}/webhooks/notify`;

 * node scripts/send-webhook.js animal created

 * node scripts/send-webhook.js publicacion updatedasync function send() {

 * node scripts/send-webhook.js adopcion deleted  const body = {

 */    type: process.env.TYPE || 'my_event',

    payload: {

const axios = require('axios');      message: process.env.MESSAGE || 'Hola desde send-webhook.js',

      ts: new Date().toISOString(),

// Configuración    },

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';    target: {

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || undefined;      room: process.env.ROOM || 'room1'

    }

// Leer argumentos de línea de comandos  };

const [,, entidad, accion] = process.argv;

  try {

if (!entidad || !accion) {    console.log('[webhook] enviando POST a', URL, 'cuerpo:', body);

  console.error('❌ Error: Debes especificar entidad y acción');    const res = await axios.post(URL, body, { headers: { 'Content-Type': 'application/json' } });

  console.log('\nUso: node scripts/send-webhook.js <entidad> <accion>');    console.log('[webhook] estado de respuesta:', res.status, 'data:', res.data);

  console.log('\nEntidades disponibles: animal, publicacion, adopcion, refugio, campania');  } catch (err) {

  console.log('Acciones disponibles: created, updated, deleted');    if (err.response) {

  process.exit(1);      console.error('[webhook] respuesta de error:', err.response.status, err.response.data);

}    } else {

      console.error('[webhook] Error:', err.message);

// ============================================================================    }

// DATOS DE PRUEBA    process.exit(1);

// ============================================================================  }

}

const testData = {

  animal: {send();

    created: {
      id_animal: 123,
      nombre: 'Luna',
      edad: 2,
      estado: 'saludable',
      descripcion: 'Perrita muy cariñosa y juguetona',
      estado_adopcion: 'disponible',
      id_especie: 1,
      id_refugio: 5,
      nombre_especie: 'Perro',
      nombre_refugio: 'Refugio Esperanza',
    },
    updated: {
      id_animal: 123,
      nombre: 'Luna',
      edad: 2,
      estado_adopcion: 'en_proceso',
      nombre_especie: 'Perro',
    },
    deleted: {
      id_animal: 123,
    },
  },
  publicacion: {
    created: {
      id_publicacion: 456,
      id_usuario: 10,
      titulo: 'Perrita en adopción - Luna',
      descripcion: 'Luna busca un hogar amoroso',
      fecha_subida: new Date().toISOString(),
      estado: 'activa',
      id_animal: 123,
      nombre_usuario: 'María González',
      nombre_animal: 'Luna',
    },
    updated: {
      id_publicacion: 456,
      titulo: 'Perrita en adopción - Luna (ACTUALIZADO)',
      estado: 'activa',
      id_usuario: 10,
    },
    deleted: {
      id_publicacion: 456,
    },
  },
  adopcion: {
    created: {
      id_adopcion: 789,
      id_publicacion: 456,
      id_usuario: 20,
      fecha_adopcion: new Date().toISOString(),
      estado: 'pendiente',
      nombre_usuario: 'Carlos Rodríguez',
      titulo_publicacion: 'Perrita en adopción - Luna',
      id_animal: 123,
      nombre_animal: 'Luna',
    },
    updated: {
      id_adopcion: 789,
      id_publicacion: 456,
      id_usuario: 20,
      estado: 'aprobada',
      nombre_usuario: 'Carlos Rodríguez',
    },
    deleted: {
      id_adopcion: 789,
    },
  },
  refugio: {
    created: {
      id_refugio: 5,
      nombre: 'Refugio Esperanza',
      direccion: 'Av. Principal 123, Ciudad',
      telefono: '+1234567890',
      descripcion: 'Refugio dedicado al cuidado de animales abandonados',
      total_animales: 45,
      capacidad_maxima: 100,
    },
    updated: {
      id_refugio: 5,
      nombre: 'Refugio Esperanza',
      total_animales: 46,
    },
    deleted: {
      id_refugio: 5,
    },
  },
  campania: {
    created: {
      id_campania: 12,
      titulo: 'Campaña de Adopción de Verano',
      descripcion: 'Gran campaña para promover adopciones responsables',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lugar: 'Parque Central',
      organizador: 'Refugio Esperanza',
      estado: 'activa',
      id_tipo_campania: 1,
      nombre_tipo_campania: 'Adopción',
      total_voluntarios: 15,
    },
    updated: {
      id_campania: 12,
      titulo: 'Campaña de Adopción de Verano',
      estado: 'activa',
      total_voluntarios: 18,
    },
    deleted: {
      id_campania: 12,
    },
  },
};

// ============================================================================
// ENVIAR WEBHOOK
// ============================================================================

async function sendWebhook() {
  const entityPlural = {
    animal: 'animals',
    publicacion: 'publicaciones',
    adopcion: 'adopciones',
    refugio: 'refugios',
    campania: 'campanias',
  };

  const endpoint = entityPlural[entidad];
  
  if (!endpoint) {
    console.error(`❌ Entidad no válida: ${entidad}`);
    console.log('Entidades disponibles: animal, publicacion, adopcion, refugio, campania');
    process.exit(1);
  }

  const eventType = `${entidad}.${accion}`;
  const payload = testData[entidad]?.[accion];

  if (!payload) {
    console.error(`❌ Acción no válida: ${accion}`);
    console.log('Acciones disponibles: created, updated, deleted');
    process.exit(1);
  }

  const webhookData = {
    type: eventType,
    payload: payload,
  };

  const url = `${SERVER_URL}/webhooks/${endpoint}`;

  console.log('📤 Enviando webhook...');
  console.log(`📍 URL: ${url}`);
  console.log(`📦 Tipo de evento: ${eventType}`);
  console.log(`📄 Payload:`, JSON.stringify(payload, null, 2));
  console.log('═'.repeat(60));

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Si hay secreto configurado, agregar firma HMAC
    if (WEBHOOK_SECRET) {
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(webhookData))
        .digest('hex');
      headers['x-signature'] = signature;
      console.log('🔒 Firma HMAC agregada');
    }

    const response = await axios.post(url, webhookData, { headers });

    console.log('✅ Webhook enviado exitosamente!');
    console.log('📨 Respuesta del servidor:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar webhook:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Mensaje:', error.message);
    }
    process.exit(1);
  }
}

sendWebhook();
