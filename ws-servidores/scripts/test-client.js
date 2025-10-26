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
  console.log('[cliente] conectado', socket.id);
  console.log(`[cliente] entrando en la sala ${ROOM}`);
  socket.emit('joinRoom', ROOM);
});

socket.on('disconnect', () => {
  console.log('[cliente] desconectado');
});

socket.on(EVENT, (payload) => {
  console.log(`[cliente] evento recibido ${EVENT}:`, payload);
});

// También escuchar evento genérico 'notification'
socket.on('notification', (payload) => {
  console.log('[cliente] notificación recibida:', payload);
});

// Mantener vivo
process.stdin.resume();
