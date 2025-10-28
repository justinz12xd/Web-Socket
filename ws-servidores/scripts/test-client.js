/**// Cliente de prueba para WebSocket (socket.io-client)

 * Script de prueba para el servidor WebSocket// Uso: node scripts/test-client.js

 * Simula un cliente frontend conectándose y recibiendo eventos// Requisitos: npm i socket.io-client

 * 

 * Uso:const { io } = require('socket.io-client');

 * node scripts/test-client.js

 */const SERVER = process.env.SERVER || 'http://localhost:4000';

const NAMESPACE = process.env.NAMESPACE || '/notifications';

const { io } = require('socket.io-client');const ROOM = process.env.ROOM || 'room1';

const EVENT = process.env.EVENT || 'my_event';

// Configuración

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';const url = `${SERVER}${NAMESPACE}`;

const NAMESPACE = '/notifications';console.log(`Conectando a ${url} ...`);



console.log('🔌 Conectando al servidor WebSocket...');const socket = io(url, { transports: ['websocket'] });

console.log(`📡 URL: ${SERVER_URL}${NAMESPACE}\n`);

socket.on('connect', () => {

// Conectar al servidor  console.log('[cliente] conectado', socket.id);

const socket = io(`${SERVER_URL}${NAMESPACE}`, {  console.log(`[cliente] entrando en la sala ${ROOM}`);

  transports: ['websocket'],  socket.emit('joinRoom', ROOM);

  reconnection: true,});

  reconnectionDelay: 1000,

  reconnectionAttempts: 5,socket.on('disconnect', () => {

});  console.log('[cliente] desconectado');

});

// ============================================================================

// EVENT HANDLERSsocket.on(EVENT, (payload) => {

// ============================================================================  console.log(`[cliente] evento recibido ${EVENT}:`, payload);

});

socket.on('connect', () => {

  console.log('✅ Conectado exitosamente!');// También escuchar evento genérico 'notification'

  console.log(`📍 Client ID: ${socket.id}\n`);socket.on('notification', (payload) => {

  console.log('👂 Escuchando eventos...\n');  console.log('[cliente] notificación recibida:', payload);

  console.log('═'.repeat(60));});

});

// Mantener vivo

socket.on('connection-success', (data) => {process.stdin.resume();

  console.log('📨 Mensaje de bienvenida:', data);
});

socket.on('disconnect', () => {
  console.log('\n❌ Desconectado del servidor');
});

socket.on('connect_error', (error) => {
  console.error('⚠️  Error de conexión:', error.message);
});

// ============================================================================
// EVENTOS DE ANIMALES
// ============================================================================

socket.on('animal.created', (data) => {
  console.log('\n🐾 ANIMAL CREADO:');
  console.log('   Nombre:', data.nombre);
  console.log('   ID:', data.id_animal);
  console.log('   Especie:', data.nombre_especie || 'N/A');
  console.log('   Refugio:', data.nombre_refugio || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('animal.updated', (data) => {
  console.log('\n🐾 ANIMAL ACTUALIZADO:');
  console.log('   Nombre:', data.nombre);
  console.log('   ID:', data.id_animal);
  console.log('   Estado:', data.estado_adopcion || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('animal.deleted', (data) => {
  console.log('\n🐾 ANIMAL ELIMINADO:');
  console.log('   ID:', data.id_animal);
  console.log('═'.repeat(60));
});

// ============================================================================
// EVENTOS DE PUBLICACIONES
// ============================================================================

socket.on('publicacion.created', (data) => {
  console.log('\n📝 PUBLICACIÓN CREADA:');
  console.log('   Título:', data.titulo);
  console.log('   ID:', data.id_publicacion);
  console.log('   Usuario:', data.nombre_usuario || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('publicacion.updated', (data) => {
  console.log('\n📝 PUBLICACIÓN ACTUALIZADA:');
  console.log('   Título:', data.titulo);
  console.log('   ID:', data.id_publicacion);
  console.log('   Estado:', data.estado || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('publicacion.deleted', (data) => {
  console.log('\n📝 PUBLICACIÓN ELIMINADA:');
  console.log('   ID:', data.id_publicacion);
  console.log('═'.repeat(60));
});

// ============================================================================
// EVENTOS DE ADOPCIONES
// ============================================================================

socket.on('adopcion.created', (data) => {
  console.log('\n🏠 ADOPCIÓN CREADA:');
  console.log('   ID:', data.id_adopcion);
  console.log('   Usuario:', data.nombre_usuario || 'N/A');
  console.log('   Animal:', data.nombre_animal || 'N/A');
  console.log('   Fecha:', data.fecha_adopcion || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('adopcion.updated', (data) => {
  console.log('\n🏠 ADOPCIÓN ACTUALIZADA:');
  console.log('   ID:', data.id_adopcion);
  console.log('   Estado:', data.estado || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('adopcion.deleted', (data) => {
  console.log('\n🏠 ADOPCIÓN ELIMINADA:');
  console.log('   ID:', data.id_adopcion);
  console.log('═'.repeat(60));
});

// ============================================================================
// EVENTOS DE REFUGIOS
// ============================================================================

socket.on('refugio.created', (data) => {
  console.log('\n🏛️  REFUGIO CREADO:');
  console.log('   Nombre:', data.nombre);
  console.log('   ID:', data.id_refugio);
  console.log('   Dirección:', data.direccion || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('refugio.updated', (data) => {
  console.log('\n🏛️  REFUGIO ACTUALIZADO:');
  console.log('   Nombre:', data.nombre);
  console.log('   ID:', data.id_refugio);
  console.log('   Total animales:', data.total_animales || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('refugio.deleted', (data) => {
  console.log('\n🏛️  REFUGIO ELIMINADO:');
  console.log('   ID:', data.id_refugio);
  console.log('═'.repeat(60));
});

// ============================================================================
// EVENTOS DE CAMPAÑAS
// ============================================================================

socket.on('campania.created', (data) => {
  console.log('\n📢 CAMPAÑA CREADA:');
  console.log('   Título:', data.titulo);
  console.log('   ID:', data.id_campania);
  console.log('   Fecha inicio:', data.fecha_inicio || 'N/A');
  console.log('   Lugar:', data.lugar || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('campania.updated', (data) => {
  console.log('\n📢 CAMPAÑA ACTUALIZADA:');
  console.log('   Título:', data.titulo);
  console.log('   ID:', data.id_campania);
  console.log('   Estado:', data.estado || 'N/A');
  console.log('═'.repeat(60));
});

socket.on('campania.deleted', (data) => {
  console.log('\n📢 CAMPAÑA ELIMINADA:');
  console.log('   ID:', data.id_campania);
  console.log('═'.repeat(60));
});

// ============================================================================
// MANEJO DE SEÑALES
// ============================================================================

process.on('SIGINT', () => {
  console.log('\n\n👋 Cerrando conexión...');
  socket.disconnect();
  process.exit(0);
});
