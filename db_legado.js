//Este era el codigo Backend antes de editarlo para incrustar la BD


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

export function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      writeDb({ usuarios: [], comunidades: [], posts: [], mensajes: [], recientes: {} });
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer la base de datos:', error);
    return { usuarios: [], comunidades: [], posts: [], mensajes: [], recientes: {} };
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al escribir en la base de datos:', error);
    return false;
  }
}
