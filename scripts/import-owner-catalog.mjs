import mongoose from 'mongoose';
import { config } from '../apps/api/src/config.mjs';
import { connectDb } from '../apps/api/src/models.mjs';
import { importOwnerCatalog } from './owner-catalog.mjs';
await connectDb(config.mongoUri);
try {
  await importOwnerCatalog({ refresh: true });
} finally {
  await mongoose.disconnect();
}
