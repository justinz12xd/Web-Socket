// Cliente de prueba para WebSocket (socket.io-client)
// Uso: node scripts/test-client.js
// Requisitos: npm i socket.io-client

const { io } = require('socket.io-client');

const SERVER = process.env.SERVER || 'http://localhost:4000';
const NAMESPACE = process.env.NAMESPACE || '/notifications';
const ROOM = process.env.ROOM || 'room1';
const EVENT = process.env.EVENT || 'my_event';

const url = `${SERVER}${NAMESPACE}`;
console.log(`Conectando a ${url} ...`);

const socket = io(url, { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('[client] connected', socket.id);
  console.log(`[client] joining room ${ROOM}`);
  socket.emit('joinRoom', ROOM);
});

socket.on('disconnect', () => {
  console.log('[client] disconnected');
});

socket.on(EVENT, (payload) => {
  console.log(`[client] received event ${EVENT}:`, payload);
});

// También escuchar evento genérico 'notification'
socket.on('notification', (payload) => {
  console.log('[client] received notification:', payload);
});

// Mantener vivo
process.stdin.resume();
