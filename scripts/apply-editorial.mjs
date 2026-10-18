// Apply the requested art direction once, preserving any custom admin-selected hero.
import fs from 'node:fs/promises';
import mongoose from 'mongoose';
import { config } from '../apps/api/src/config.mjs';
import { connectDb, Settings } from '../apps/api/src/models.mjs';
const images = JSON.parse(await fs.readFile('data/editorial-media.json', 'utf8'));
await connectDb(config.mongoUri);
try {
  const site = await Settings.findOne({ key: 'site' });
  if (site?.heroImage?.startsWith('/media/96b35ba1'))
    site.heroImage = images.find((i) => i.role === 'hero').src;
  if (site && !site.aboutImage) site.aboutImage = images.find((i) => i.role === 'detail').src;
  if (site) await site.save();
  console.log('Editorial imagery configured. Product photography unchanged.');
} finally {
  await mongoose.disconnect();
}
