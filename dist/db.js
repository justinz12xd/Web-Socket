"use strict";
// db.ts
// Implementación tolerante: intenta cargar `better-sqlite3` si está disponible,
// pero si no, usa un almacenamiento en memoria. Esto facilita ejecutar el
// proyecto en entornos Windows sin herramientas de compilación nativas.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert = insert;
exports.update = update;
exports.del = del;
exports.getAll = getAll;
exports.getById = getById;
exports.fallbackInsert = fallbackInsert;
exports.fallbackGetAll = fallbackGetAll;
exports.fallbackGetById = fallbackGetById;
exports.fallbackUpdate = fallbackUpdate;
exports.fallbackDel = fallbackDel;
const path_1 = __importDefault(require("path"));
let useSqlite = false;
let sqliteDb = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const BetterSqlite3 = require('better-sqlite3');
    const dbFile = path_1.default.join(__dirname, '..', 'data', 'love4pets.sqlite');
    sqliteDb = new BetterSqlite3(dbFile);
    useSqlite = true;
    // crear tablas si no existen (DDL básico)
    sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS usuario (id_usuario TEXT PRIMARY KEY, nombre TEXT, email TEXT UNIQUE, contrasenia TEXT, telefono TEXT, direccion TEXT, fecha_registro TEXT);
    CREATE TABLE IF NOT EXISTS especie (id_especie TEXT PRIMARY KEY, nombre TEXT UNIQUE);
    CREATE TABLE IF NOT EXISTS refugio (id_refugio TEXT PRIMARY KEY, nombre TEXT, direccion TEXT, telefono TEXT, descripcion TEXT);
    CREATE TABLE IF NOT EXISTS animal (id_animal TEXT PRIMARY KEY, nombre TEXT, id_especie TEXT, edad TEXT, estado TEXT, descripcion TEXT, fotos TEXT, estado_adopcion TEXT, id_refugio TEXT);
    CREATE TABLE IF NOT EXISTS publicacion (id_publicacion TEXT PRIMARY KEY, titulo TEXT, descripcion TEXT, fecha_subida TEXT, estado TEXT, id_usuario TEXT, id_animal TEXT);
    CREATE TABLE IF NOT EXISTS adopcion (id_adopcion TEXT PRIMARY KEY, fecha_adopcion TEXT, estado TEXT, id_publicacion TEXT, id_usuario TEXT);
    CREATE TABLE IF NOT EXISTS donacion (id_donacion TEXT PRIMARY KEY, monto REAL, fecha TEXT, id_usuario TEXT, id_causa_urgente TEXT);
  `);
}
catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? e.message : String(e);
    console.warn('better-sqlite3 no disponible, usando almacenamiento en memoria', msg);
}
// Fallback: almacenamiento en memoria por tabla
const memoryStore = {};
function ensureMemoryTable(table) {
    if (!memoryStore[table])
        memoryStore[table] = new Map();
}
// Helper para construir nombre de columna id por convención (id_{table})
function idColumnFor(table) {
    return `id_${table}`;
}
// Exported functions. Intentan usar SQLite si está disponible, si no usan memoria.
async function insert(table, obj) {
    if (useSqlite && sqliteDb) {
        const cols = Object.keys(obj);
        const placeholders = cols.map(() => '?').join(',');
        const stmt = sqliteDb.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`);
        stmt.run(...cols.map(c => obj[c]));
        return;
    }
    ensureMemoryTable(table);
    const idCol = idColumnFor(table);
    const id = obj[idCol] || obj.id || String(Date.now()) + Math.random();
    const key = String(id);
    memoryStore[table].set(key, { ...obj, [idCol]: key });
}
async function update(table, id, obj) {
    if (useSqlite && sqliteDb) {
        const idCol = idColumnFor(table);
        const cols = Object.keys(obj).filter(k => k !== idCol);
        const assignments = cols.map(c => `${c} = ?`).join(',');
        const stmt = sqliteDb.prepare(`UPDATE ${table} SET ${assignments} WHERE ${idCol} = ?`);
        stmt.run(...cols.map(c => obj[c]), id);
        return getById(table, id);
    }
    ensureMemoryTable(table);
    const idCol = idColumnFor(table);
    const existing = memoryStore[table].get(id);
    if (!existing)
        throw new Error('not_found');
    const updated = { ...existing, ...obj, [idCol]: id };
    memoryStore[table].set(id, updated);
    return updated;
}
async function del(table, id) {
    if (useSqlite && sqliteDb) {
        const idCol = idColumnFor(table);
        const stmt = sqliteDb.prepare(`DELETE FROM ${table} WHERE ${idCol} = ?`);
        stmt.run(id);
        return;
    }
    ensureMemoryTable(table);
    memoryStore[table].delete(id);
}
async function getAll(table) {
    if (useSqlite && sqliteDb) {
        return sqliteDb.prepare(`SELECT * FROM ${table}`).all();
    }
    ensureMemoryTable(table);
    return Array.from(memoryStore[table].values());
}
async function getById(table, id) {
    if (useSqlite && sqliteDb) {
        const idCol = idColumnFor(table);
        return sqliteDb.prepare(`SELECT * FROM ${table} WHERE ${idCol} = ?`).get(id);
    }
    ensureMemoryTable(table);
    return memoryStore[table].get(id);
}
// Funciones explícitas de fallback (compatibilidad con server.ts)
function fallbackInsert(table, obj) {
    // síncrono
    ensureMemoryTable(table);
    const idCol = idColumnFor(table);
    const id = obj[idCol] || obj.id || String(Date.now()) + Math.random();
    memoryStore[table].set(String(id), { ...obj, [idCol]: String(id) });
}
function fallbackGetAll(table) {
    ensureMemoryTable(table);
    return Array.from(memoryStore[table].values());
}
function fallbackGetById(table, id) {
    ensureMemoryTable(table);
    return memoryStore[table].get(id);
}
function fallbackUpdate(table, id, obj) {
    ensureMemoryTable(table);
    const existing = memoryStore[table].get(id) || {};
    const updated = { ...existing, ...obj };
    memoryStore[table].set(id, updated);
    return updated;
}
function fallbackDel(table, id) {
    ensureMemoryTable(table);
    memoryStore[table].delete(id);
}
exports.default = {
    insert,
    update,
    del,
    getAll,
    getById,
    fallbackInsert,
    fallbackGetAll,
    fallbackGetById,
    fallbackUpdate,
    fallbackDel,
};
