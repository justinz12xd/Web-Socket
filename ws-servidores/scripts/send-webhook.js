// Script que envía un POST al webhook de la app
// Uso: node scripts/send-webhook.js
// Requisitos: npm i axios

const axios = require('axios');

const SERVER = process.env.SERVER || 'http://localhost:4000';
const URL = `${SERVER}/webhooks/notify`;

async function send() {
  const body = {
    type: process.env.TYPE || 'my_event',
    payload: {
      message: process.env.MESSAGE || 'Hola desde send-webhook.js',
      ts: new Date().toISOString(),
    },
    target: {
      room: process.env.ROOM || 'room1'
    }
  };

  try {
    console.log('[webhook] enviando POST a', URL, 'cuerpo:', body);
    const res = await axios.post(URL, body, { headers: { 'Content-Type': 'application/json' } });
    console.log('[webhook] estado de respuesta:', res.status, 'data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('[webhook] respuesta de error:', err.response.status, err.response.data);
    } else {
      console.error('[webhook] Error:', err.message);
    }
    process.exit(1);
  }
}

send();
