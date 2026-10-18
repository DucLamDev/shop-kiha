import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
dotenv.config({ path: path.join(root, '.env'), quiet: true });
export const config = {
  mongoUri: process.env.MONGODB_URI,
  port: Number(process.env.API_PORT || 4000),
  host: process.env.API_HOST || '127.0.0.1',
  production: process.env.NODE_ENV === 'production',
  origins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
