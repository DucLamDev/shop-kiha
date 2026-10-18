import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { config, root } from '../apps/api/src/config.mjs';
import { connectDb, Admin } from '../apps/api/src/models.mjs';
const generateLocal = process.argv.includes('--generate-local');
if (generateLocal && config.production)
  throw new Error('Local bootstrap is not allowed in production.');
const email = (process.env.ADMIN_EMAIL || (generateLocal ? 'admin@kiha.local' : '')).toLowerCase();
const password =
  process.env.ADMIN_PASSWORD || (generateLocal ? crypto.randomBytes(24).toString('base64url') : '');
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  password.length < 14 ||
  Buffer.byteLength(password, 'utf8') > 72
)
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (14+ characters, maximum 72 UTF-8 bytes).');
await connectDb(config.mongoUri);
try {
  if (await Admin.exists({ email }))
    throw new Error('Admin already exists. This command never overwrites an existing account.');
  await Admin.create({
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
    isActive: true,
  });
  if (generateLocal) {
    await fs.mkdir(path.join(root, '.local'), { recursive: true });
    await fs.writeFile(
      path.join(root, '.local/admin-credentials.txt'),
      `Local development only\nEmail: ${email}\nPassword: ${password}\n`,
      { mode: 0o600 },
    );
    console.log(
      'Admin created. Local credentials are in .local/admin-credentials.txt (ignored by Git).',
    );
  } else console.log('Admin created.');
} finally {
  await mongoose.disconnect();
}
