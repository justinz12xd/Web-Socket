"use strict";
// Servidor WebSocket + API HTTP para Love4Pets
// Comentarios y documentación en español para facilitar la comprensión.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db = __importStar(require("./db"));
const validation = __importStar(require("./validation"));
// Versión única y limpia del servidor. Mantiene las rutas y la compatibilidad
// con las funciones exportadas por `db.ts` (insert, update, del, getAll, getById,
// y los fallbacks `fallback*`).
const app = (0, express_1.default)();
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] } });
// Generador simple de id
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
// Almacenamiento en memoria (cache) para entidades si la DB no responde
const store = {
    usuario: new Map(),
    especie: new Map(),
    refugio: new Map(),
    animal: new Map(),
    publicacion: new Map(),
    adopcion: new Map(),
    donacion: new Map(),
};
io.on('connection', (socket) => {
    socket.on('join', (userId) => { socket.join(userId); });
});
// Endpoint para emitir eventos arbitrarios desde HTTP (útil para pruebas)
app.post('/emit', (req, res) => {
    const { event, data, room } = req.body;
    if (!event || !data)
        return res.status(400).json({ error: 'Event and data are required' });
    if (room)
        io.to(room).emit(event, data);
    else
        io.emit(event, data);
    res.json({ success: true });
});
// Emite evento de entidad a todos y a salas específicas cuando aplica
function emitEntityEvent(entity, action, payload) {
    const eventName = `${entity}_${action}`;
    io.emit(eventName, payload);
    const potentialRooms = ['id_usuario', 'id_refugio', 'id_animal'];
    for (const key of potentialRooms)
        if (payload && key in payload)
            io.to(String(payload[key])).emit(eventName, payload);
}
// Registrar CRUD genérico conformando las rutas solicitadas
function registerCrud(entity) {
    const map = store[entity] || new Map();
    const base = `/api/${entity}`;
    app.post(base, async (req, res) => {
        const body = req.body;
        const idKey = Object.keys(body).find(k => k.startsWith('id_')) || `id_${entity}`;
        const id = body[idKey] || uuidv4();
        const item = { ...body, [idKey]: id };
        // Validación usando zod si existe el esquema
        try {
            const schema = validation[`${capitalize(entity)}Schema`];
            if (schema)
                schema.parse(item);
        }
        catch (err) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors || err.message });
        }
        try {
            await db.insert(entity, item);
        }
        catch (e) {
            console.warn('DB insert failed', e);
            db.fallbackInsert(entity, item);
        }
        map.set(id, item);
        emitEntityEvent(entity, 'created', item);
        res.status(201).json(item);
    });
    app.get(base, async (_req, res) => {
        try {
            const rows = await db.getAll(entity);
            if (rows && rows.length)
                return res.json(rows);
        }
        catch (e) { }
        res.json(Array.from(map.values()));
    });
    app.get(`${base}/:id`, async (req, res) => {
        const { id } = req.params;
        try {
            const row = await db.getById(entity, id);
            if (row)
                return res.json(row);
        }
        catch (e) { }
        const found = map.get(id);
        if (!found)
            return res.status(404).json({ error: 'Not found' });
        res.json(found);
    });
    app.put(`${base}/:id`, async (req, res) => {
        const { id } = req.params;
        const existing = map.get(id);
        if (!existing)
            return res.status(404).json({ error: 'Not found' });
        const updated = { ...existing, ...req.body };
        try {
            const schema = validation[`${capitalize(entity)}Schema`];
            if (schema)
                schema.parse(updated);
        }
        catch (err) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors || err.message });
        }
        try {
            await db.update(entity, id, updated);
        }
        catch (e) {
            console.warn('DB update failed', e);
            db.fallbackUpdate(entity, id, updated);
        }
        map.set(id, updated);
        emitEntityEvent(entity, 'updated', updated);
        res.json(updated);
    });
    app.delete(`${base}/:id`, async (req, res) => {
        const { id } = req.params;
        const existing = map.get(id);
        if (!existing)
            return res.status(404).json({ error: 'Not found' });
        try {
            await db.del(entity, id);
        }
        catch (e) {
            console.warn('DB delete failed', e);
            db.fallbackDel(entity, id);
        }
        map.delete(id);
        emitEntityEvent(entity, 'deleted', existing);
        res.json({ success: true });
    });
}
['usuario', 'animal', 'publicacion', 'adopcion', 'donacion', 'refugio'].forEach(registerCrud);
app.get('/health', (_req, res) => res.json({ ok: true }));
function capitalize(s) { if (!s)
    return s; return s[0].toUpperCase() + s.slice(1); }
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
