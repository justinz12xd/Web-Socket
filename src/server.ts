// Servidor WebSocket + API HTTP para Love4Pets
// Comentarios y documentación en español para facilitar la comprensión.
//Uso del framework Socket.io

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as db from './db';
import * as validation from './validation';

// Versión única y limpia del servidor. Mantiene las rutas y la compatibilidad
// con las funciones exportadas por `db.ts` (insert, update, del, getAll, getById,
// y los fallbacks `fallback*`).

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] } });

// Generador simple de id
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type GenericRecord = { [k: string]: any };

// Almacenamiento en memoria (cache) para entidades si la DB no responde
const store: Record<string, Map<string, GenericRecord>> = {
  usuario: new Map(),
  especie: new Map(),
  refugio: new Map(),
  animal: new Map(),
  publicacion: new Map(),
  adopcion: new Map(),
  donacion: new Map(),
};

io.on('connection', (socket) => {
  socket.on('join', (userId: string) => { socket.join(userId); });
});

// Endpoint para emitir eventos arbitrarios desde HTTP (útil para pruebas)
app.post('/emit', (req, res) => {
  const { event, data, room } = req.body;
  if (!event || !data) return res.status(400).json({ error: 'Event and data are required' });
  if (room) io.to(room).emit(event, data);
  else io.emit(event, data);
  res.json({ success: true });
});

// Emite evento de entidad a todos y a salas específicas cuando aplica
function emitEntityEvent(entity: string, action: 'created' | 'updated' | 'deleted', payload: any) {
  const eventName = `${entity}_${action}`;
  io.emit(eventName, payload);
  const potentialRooms = ['id_usuario', 'id_refugio', 'id_animal'];
  for (const key of potentialRooms) if (payload && key in payload) io.to(String(payload[key])).emit(eventName, payload);
}

// Registrar CRUD genérico conformando las rutas solicitadas
function registerCrud(entity: string) {
  const map = store[entity] || new Map<string, GenericRecord>();
  const base = `/api/${entity}`;

  app.post(base, async (req, res) => {
    const body = req.body as GenericRecord;
    const idKey = Object.keys(body).find(k => k.startsWith('id_')) || `id_${entity}`;
    const id = (body[idKey] as string) || uuidv4();
    const item: GenericRecord = { ...body, [idKey]: id };

    // Validación usando zod si existe el esquema
    try {
      const schema: any = (validation as any)[`${capitalize(entity)}Schema`];
      if (schema) schema.parse(item);
    } catch (err) {
      return res.status(400).json({ error: 'Validation failed', details: (err as any).errors || (err as any).message });
    }

    try { await db.insert(entity, item); } catch (e) { console.warn('DB insert failed', e); db.fallbackInsert(entity, item); }

    map.set(id, item);
    emitEntityEvent(entity, 'created', item);
    res.status(201).json(item);
  });

  app.get(base, async (_req, res) => {
    try { const rows = await db.getAll(entity); if (rows && rows.length) return res.json(rows); } catch (e) { }
    res.json(Array.from(map.values()));
  });

  app.get(`${base}/:id`, async (req, res) => {
    const { id } = req.params;
    try { const row = await db.getById(entity, id); if (row) return res.json(row); } catch (e) { }
    const found = map.get(id);
    if (!found) return res.status(404).json({ error: 'Not found' });
    res.json(found);
  });

  app.put(`${base}/:id`, async (req, res) => {
    const { id } = req.params;
    const existing = map.get(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const updated = { ...existing, ...(req.body as GenericRecord) };

    try {
      const schema: any = (validation as any)[`${capitalize(entity)}Schema`];
      if (schema) schema.parse(updated);
    } catch (err) {
      return res.status(400).json({ error: 'Validation failed', details: (err as any).errors || (err as any).message });
    }

    try { await db.update(entity, id, updated); } catch (e) { console.warn('DB update failed', e); db.fallbackUpdate(entity, id, updated); }
    map.set(id, updated);
    emitEntityEvent(entity, 'updated', updated);
    res.json(updated);
  });

  app.delete(`${base}/:id`, async (req, res) => {
    const { id } = req.params;
    const existing = map.get(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    try { await db.del(entity, id); } catch (e) { console.warn('DB delete failed', e); db.fallbackDel(entity, id); }
    map.delete(id);
    emitEntityEvent(entity, 'deleted', existing);
    res.json({ success: true });
  });
}

['usuario','animal','publicacion','adopcion','donacion','refugio'].forEach(registerCrud);

app.get('/health', (_req, res) => res.json({ ok: true }));

function capitalize(s: string) { if (!s) return s; return s[0].toUpperCase() + s.slice(1); }

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));

